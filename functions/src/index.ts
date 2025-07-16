/**
 * Firebase Cloud Functions Entry Point
 * 
 * Defines all HTTP endpoints and Firebase triggers for the foster care agency system
 * Includes email processing, API endpoints, and database triggers
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import multer from 'multer';

// Initialize Firebase Admin
admin.initializeApp();

// Import modules
import { 
  processReferralEmail, 
  parseSendGridWebhook, 
  parseMailgunWebhook 
} from './email/processor';
import { 
  matchReferralToCarers
} from './matching/algorithm';
import { 
  createAuditLog, 
  logCarerChange, 
  logReferralChange,
  getAuditLogs 
} from './utils/audit';
import { CarerProfile, ChildReferral } from './types';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Create Express app for API endpoints
const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware to verify Firebase Auth token
const authenticateUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No authorization token provided' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get user document to check role and permissions
    const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists) {
      return res.status(403).json({ success: false, error: 'User not found' });
    }
    
    const userData = userDoc.data();
    if (!userData?.active) {
      return res.status(403).json({ success: false, error: 'User account is inactive' });
    }
    
    req.user = { ...decodedToken, ...userData };
    return next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

// ============================================================================
// HEALTH AND TEST ENDPOINTS
// ============================================================================

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Foster Care API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ============================================================================
// EMAIL PROCESSING ENDPOINTS
// ============================================================================

/**
 * SendGrid inbound email webhook
 */
app.post('/webhook/sendgrid', async (req, res) => {
  try {
    console.log('Received SendGrid webhook');
    
    const emailData = parseSendGridWebhook(req.body);
    const referralId = await processReferralEmail(emailData);
    
    res.json({ 
      success: true, 
      message: 'Email processed successfully',
      referralId 
    });
  } catch (error) {
    console.error('SendGrid webhook error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

/**
 * Mailgun inbound email webhook
 */
app.post('/webhook/mailgun', upload.any(), async (req, res) => {
  try {
    console.log('Received Mailgun webhook');
    
    const emailData = parseMailgunWebhook(req.body, req.files);
    const referralId = await processReferralEmail(emailData);
    
    res.json({ 
      success: true, 
      message: 'Email processed successfully',
      referralId 
    });
  } catch (error) {
    console.error('Mailgun webhook error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

// ============================================================================
// CARER MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * Get all carers with optional filtering
 */
app.get('/api/carers', authenticateUser, async (req, res) => {
  try {
    const db = admin.firestore();
    let query = db.collection('carers').orderBy('updatedAt', 'desc');
    
    // Apply filters
    const { status, location, limit } = req.query;
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (location) {
      query = query.where('preferredLocation', '==', location);
    }
    
    if (limit) {
      query = query.limit(parseInt(limit as string));
    }
    
    const snapshot = await query.get();
    const carers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    res.json({ success: true, data: carers });
  } catch (error) {
    console.error('Error fetching carers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch carers' });
  }
});

/**
 * Get specific carer by ID
 */
app.get('/api/carers/:id', authenticateUser, async (req, res) => {
  try {
    const db = admin.firestore();
    const doc = await db.collection('carers').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Carer not found' });
    }
    
    return res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('Error fetching carer:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch carer' });
  }
});

/**
 * Create new carer profile
 */
app.post('/api/carers', authenticateUser, async (req, res) => {
  try {
    const db = admin.firestore();
    const user = req.user;
    
    const carerData: Partial<CarerProfile> = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.uid,
      updatedBy: user.uid
    };
    
    const docRef = await db.collection('carers').add(carerData);
    
    // Log the creation
    await logCarerChange(
      docRef.id,
      'created',
      user.uid,
      user.name,
      carerData,
      'New carer profile created'
    );
    
    res.json({ 
      success: true, 
      data: { id: docRef.id, ...carerData },
      message: 'Carer profile created successfully' 
    });
  } catch (error) {
    console.error('Error creating carer:', error);
    res.status(500).json({ success: false, error: 'Failed to create carer' });
  }
});

/**
 * Update carer profile
 */
app.put('/api/carers/:id', authenticateUser, async (req, res) => {
  try {
    const db = admin.firestore();
    const user = req.user;
    
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
      updatedBy: user.uid
    };
    
    await db.collection('carers').doc(req.params.id).update(updateData);
    
    // Log the update
    await logCarerChange(
      req.params.id,
      'updated',
      user.uid,
      user.name,
      updateData,
      'Carer profile updated'
    );
    
    res.json({ 
      success: true, 
      message: 'Carer profile updated successfully' 
    });
  } catch (error) {
    console.error('Error updating carer:', error);
    res.status(500).json({ success: false, error: 'Failed to update carer' });
  }
});

// ============================================================================
// REFERRAL MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * Get all referrals with optional filtering
 */
app.get('/api/referrals', authenticateUser, async (req, res) => {
  try {
    const db = admin.firestore();
    let query = db.collection('referrals').orderBy('createdAt', 'desc');
    
    // Apply filters
    const { status, urgency, assignedCarerId, limit } = req.query;
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (urgency) {
      query = query.where('urgency', '==', urgency);
    }
    
    if (assignedCarerId) {
      query = query.where('assignedCarerId', '==', assignedCarerId);
    }
    
    if (limit) {
      query = query.limit(parseInt(limit as string));
    }
    
    const snapshot = await query.get();
    const referrals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    res.json({ success: true, data: referrals });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch referrals' });
  }
});

/**
 * Get specific referral by ID
 */
app.get('/api/referrals/:id', authenticateUser, async (req, res) => {
  try {
    const db = admin.firestore();
    const doc = await db.collection('referrals').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, error: 'Referral not found' });
    }
    
    return res.json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('Error fetching referral:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch referral' });
  }
});

/**
 * Update referral status
 */
app.put('/api/referrals/:id/status', authenticateUser, async (req, res) => {
  try {
    const db = admin.firestore();
    const user = req.user;
    const { status, reason, notes } = req.body;
    
    // Get current referral
    const referralDoc = await db.collection('referrals').doc(req.params.id).get();
    if (!referralDoc.exists) {
      return res.status(404).json({ success: false, error: 'Referral not found' });
    }
    
    const currentData = referralDoc.data();
    const statusChange = {
      from: currentData?.status,
      to: status,
      timestamp: new Date(),
      changedBy: user.uid,
      reason,
      notes
    };
    
    await db.collection('referrals').doc(req.params.id).update({
      status,
      updatedAt: new Date(),
      statusHistory: admin.firestore.FieldValue.arrayUnion(statusChange)
    });
    
    // Log the status change
    await logReferralChange(
      req.params.id,
      'status_changed',
      user.uid,
      user.name,
      { from: currentData?.status, to: status },
      notes
    );
    
    return res.json({ 
      success: true, 
      message: 'Referral status updated successfully' 
    });
  } catch (error) {
    console.error('Error updating referral status:', error);
    return res.status(500).json({ success: false, error: 'Failed to update referral status' });
  }
});

/**
 * Assign referral to carer
 */
app.post('/api/referrals/:id/assign', authenticateUser, async (req, res) => {
  try {
    const db = admin.firestore();
    const user = req.user;
    const { carerId, notes } = req.body;
    
    // Verify carer exists
    const carerDoc = await db.collection('carers').doc(carerId).get();
    if (!carerDoc.exists) {
      return res.status(404).json({ success: false, error: 'Carer not found' });
    }
    
    const assignmentData = {
      assignedCarerId: carerId,
      assignedAt: new Date(),
      assignedBy: user.uid,
      status: 'placed',
      updatedAt: new Date(),
      statusHistory: admin.firestore.FieldValue.arrayUnion({
        from: 'matched',
        to: 'placed',
        timestamp: new Date(),
        changedBy: user.uid,
        reason: 'Assigned to carer',
        notes
      })
    };
    
    await db.collection('referrals').doc(req.params.id).update(assignmentData);
    
    // Log the assignment
    await logReferralChange(
      req.params.id,
      'assigned',
      user.uid,
      user.name,
      { assignedCarerId: carerId },
      notes
    );
    
    return res.json({ 
      success: true, 
      message: 'Referral assigned successfully' 
    });
  } catch (error) {
    console.error('Error assigning referral:', error);
    return res.status(500).json({ success: false, error: 'Failed to assign referral' });
  }
});

/**
 * Trigger re-matching for a referral
 */
app.post('/api/referrals/:id/rematch', authenticateUser, async (req, res) => {
  try {
    const db = admin.firestore();
    const user = req.user;
    
    // Get referral data
    const referralDoc = await db.collection('referrals').doc(req.params.id).get();
    if (!referralDoc.exists) {
      return res.status(404).json({ success: false, error: 'Referral not found' });
    }
    
    const referralData = referralDoc.data() as ChildReferral;
    
    // Get all active carers
    const carersSnapshot = await db.collection('carers')
      .where('status', '==', 'active')
      .get();
    
    const carers = carersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CarerProfile[];
    
    // Calculate new matches
    const matchResults = matchReferralToCarers(referralData, carers);
    
    // Convert to MatchedCarer format
    const matchedCarers = matchResults.map(result => ({
      carerId: result.carerId,
      carerName: carers.find(c => c.id === result.carerId)?.name || 'Unknown',
      score: result.score,
      matchDetails: result.matchDetails,
      recommended: result.recommended,
      contacted: false
    }));
    
    // Update referral with new matches
    await db.collection('referrals').doc(req.params.id).update({
      matchedCarers,
      updatedAt: new Date(),
      statusHistory: admin.firestore.FieldValue.arrayUnion({
        from: referralData.status,
        to: 'matched',
        timestamp: new Date(),
        changedBy: user.uid,
        reason: 'Manual re-matching triggered',
        notes: `Found ${matchedCarers.length} potential matches`
      })
    });
    
    // Log the re-matching
    await logReferralChange(
      req.params.id,
      'updated',
      user.uid,
      user.name,
      { matchedCarers: matchedCarers.length },
      'Manual re-matching completed'
    );
    
    return res.json({ 
      success: true, 
      data: { matches: matchedCarers.length },
      message: 'Re-matching completed successfully' 
    });
  } catch (error) {
    console.error('Error re-matching referral:', error);
    return res.status(500).json({ success: false, error: 'Failed to re-match referral' });
  }
});

// ============================================================================
// AUDIT LOG ENDPOINTS
// ============================================================================

/**
 * Get audit logs for an entity
 */
app.get('/api/audit/:entityType/:entityId', authenticateUser, async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const auditLogs = await getAuditLogs(entityType as any, entityId, limit);
    
    res.json({ success: true, data: auditLogs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch audit logs' });
  }
});

// ============================================================================
// DASHBOARD STATISTICS ENDPOINTS
// ============================================================================

/**
 * Get dashboard statistics
 */
app.get('/api/dashboard/stats', authenticateUser, async (req, res) => {
  try {
    const db = admin.firestore();
    
    // Get counts for different statuses
    const [carersSnapshot, referralsSnapshot, activeReferralsSnapshot, assignedReferralsSnapshot] = await Promise.all([
      db.collection('carers').where('status', '==', 'active').get(),
      db.collection('referrals').get(),
      db.collection('referrals').where('status', 'in', ['pending', 'matched']).get(),
      db.collection('referrals').where('status', '==', 'assigned').get()
    ]);
    
    const stats = {
      totalCarers: carersSnapshot.size,
      totalReferrals: referralsSnapshot.size,
      activeReferrals: activeReferralsSnapshot.size,
      assignedReferrals: assignedReferralsSnapshot.size
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
  }
});

/**
 * Get daily referrals summary
 */
app.get('/api/dashboard/daily-summary', authenticateUser, async (req, res) => {
  try {
    const db = admin.firestore();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const referralsSnapshot = await db.collection('referrals').get();
    const todayReferrals = referralsSnapshot.docs.filter(doc => {
      const data = doc.data();
      const createdDate = data.createdAt?.toDate();
      return createdDate && createdDate >= today;
    });
    
    const summary = {
      totalToday: todayReferrals.length,
      urgentToday: todayReferrals.filter(doc => doc.data().urgency === 'urgent').length,
      matchedToday: todayReferrals.filter(doc => doc.data().status === 'matched').length
    };
    
    res.json({ success: true, data: summary });
  } catch (error) {
    console.error('Error fetching daily summary:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch daily summary' });
  }
});

// Mount the Express app as a Cloud Function
export const api = functions.https.onRequest(app);

// ============================================================================
// FIRESTORE TRIGGERS
// ============================================================================

/**
 * Trigger matching when a new referral is created
 */
export const onReferralCreated = functions.firestore
  .document('referrals/{referralId}')
  .onCreate(async (snap, context) => {
    const referralData = snap.data() as ChildReferral;
    
    // Only trigger matching if data extraction was successful
    if (!referralData.extractedData) {
      console.log('Skipping matching for referral with failed extraction');
      return;
    }
    
    try {
      // Get all active carers
      const carersSnapshot = await admin.firestore()
        .collection('carers')
        .where('status', '==', 'active')
        .get();
      
      const carers = carersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CarerProfile[];
      
      // Calculate matches
      const matchResults = matchReferralToCarers(referralData, carers);
      
      // Convert to MatchedCarer format
      const matchedCarers = matchResults.map(result => ({
        carerId: result.carerId,
        carerName: carers.find(c => c.id === result.carerId)?.name || 'Unknown',
        score: result.score,
        matchDetails: result.matchDetails,
        recommended: result.recommended,
        contacted: false
      }));
      
      // Update referral with matches
      await snap.ref.update({
        matchedCarers,
        status: 'matched',
        processedAt: new Date(),
        statusHistory: admin.firestore.FieldValue.arrayUnion({
          from: 'pending',
          to: 'matched',
          timestamp: new Date(),
          changedBy: 'system',
          reason: 'Automatic matching completed',
          notes: `Found ${matchedCarers.length} potential matches`
        })
      });
      
      console.log(`Matching completed for referral ${context.params.referralId}: ${matchedCarers.length} matches`);
      
    } catch (error) {
      console.error('Error in matching trigger:', error);
    }
  });

/**
 * Create audit log when carer is modified
 */
export const onCarerWrite = functions.firestore
  .document('carers/{carerId}')
  .onWrite(async (change, context) => {
    const carerId = context.params.carerId;
    
    if (!change.before.exists) {
      // Document created
      const newData = change.after.data();
      await createAuditLog({
        entityType: 'carer',
        entityId: carerId,
        action: 'created',
        userId: newData?.createdBy || 'system',
        userName: 'System',
        timestamp: new Date(),
        changes: newData || {},
        notes: 'Carer profile created'
      });
    } else if (!change.after.exists) {
      // Document deleted
      const oldData = change.before.data();
      await createAuditLog({
        entityType: 'carer',
        entityId: carerId,
        action: 'deleted',
        userId: 'system',
        userName: 'System',
        timestamp: new Date(),
        changes: oldData || {},
        notes: 'Carer profile deleted'
      });
    } else {
      // Document updated
      const newData = change.after.data();
      const oldData = change.before.data();
      
      // Calculate changes
      const changes: Record<string, any> = {};
      for (const key in newData) {
        if (newData[key] !== oldData?.[key]) {
          changes[key] = { from: oldData?.[key], to: newData[key] };
        }
      }
      
      if (Object.keys(changes).length > 0) {
        await createAuditLog({
          entityType: 'carer',
          entityId: carerId,
          action: 'updated',
          userId: newData?.updatedBy || 'system',
          userName: 'System',
          timestamp: new Date(),
          changes,
          notes: 'Carer profile updated'
        });
      }
    }
  });

/**
 * Create audit log when referral is modified
 */
export const onReferralWrite = functions.firestore
  .document('referrals/{referralId}')
  .onWrite(async (change, context) => {
    const referralId = context.params.referralId;
    
    if (!change.before.exists) {
      // Document created - audit log already created in processor
      return;
    } else if (!change.after.exists) {
      // Document deleted
      const oldData = change.before.data();
      await createAuditLog({
        entityType: 'referral',
        entityId: referralId,
        action: 'deleted',
        userId: 'system',
        userName: 'System',
        timestamp: new Date(),
        changes: oldData || {},
        notes: 'Referral deleted'
      });
    } else {
      // Document updated
      const newData = change.after.data();
      const oldData = change.before.data();
      
      // Calculate changes
      const changes: Record<string, any> = {};
      for (const key in newData) {
        if (key !== 'updatedAt' && newData[key] !== oldData?.[key]) {
          changes[key] = { from: oldData?.[key], to: newData[key] };
        }
      }
      
      if (Object.keys(changes).length > 0) {
        await createAuditLog({
          entityType: 'referral',
          entityId: referralId,
          action: 'updated',
          userId: 'system',
          userName: 'System',
          timestamp: new Date(),
          changes,
          notes: 'Referral updated'
        });
      }
    }
  }); 