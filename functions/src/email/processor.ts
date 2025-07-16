/**
 * Email Processing Module
 * 
 * Processes incoming emails with PDF attachments containing IFA referral forms
 * Extracts child data and creates referral records in Firestore
 */

import * as admin from 'firebase-admin';
import { ParsedEmailData, EmailAttachment, ChildReferral } from '../types';
import { extractDataFromPDF } from './pdfExtractor';
import { createAuditLog } from '../utils/audit';

/**
 * Process an email with potential referral PDF attachment
 */
export async function processReferralEmail(emailData: ParsedEmailData): Promise<string> {
  console.log('Processing referral email from:', emailData.from);
  
  try {
    // Filter PDF attachments
    const pdfAttachments = emailData.attachments.filter(
      attachment => attachment.contentType === 'application/pdf'
    );
    
    if (pdfAttachments.length === 0) {
      throw new Error('No PDF attachments found in email');
    }
    
    // Process each PDF attachment (typically there should be one IFA form)
    const referralPromises = pdfAttachments.map(async (attachment) => {
      return await processReferralPDF(attachment, emailData);
    });
    
    const referralIds = await Promise.all(referralPromises);
    
    console.log(`Successfully processed ${referralIds.length} referral(s)`);
    return referralIds[0]; // Return first referral ID
    
  } catch (error) {
    console.error('Error processing referral email:', error);
    
    // Create error log
    await createAuditLog({
      entityType: 'referral',
      entityId: 'unknown',
      action: 'created',
      userId: 'system',
      userName: 'Email Processor',
      timestamp: new Date(),
      changes: {
        error: error instanceof Error ? error.message : 'Unknown error',
        emailFrom: emailData.from,
        emailSubject: emailData.subject
      },
      notes: 'Failed to process referral email'
    });
    
    throw error;
  }
}

/**
 * Process individual PDF attachment and create referral
 */
async function processReferralPDF(
  attachment: EmailAttachment,
  emailData: ParsedEmailData
): Promise<string> {
  const db = admin.firestore();
  const storage = admin.storage();
  
      // Generate unique referral ID
    const referralId = admin.firestore().collection('referrals').doc().id;
  
  try {
    // 1. Save PDF to Firebase Storage
    const fileName = `${referralId}_${attachment.filename}`;
    const filePath = `referral-attachments/${referralId}/${fileName}`;
    const file = storage.bucket().file(filePath);
    
    await file.save(attachment.content, {
      metadata: {
        contentType: attachment.contentType,
        metadata: {
          originalName: attachment.filename,
          referralId: referralId,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'email-processor'
        }
      }
    });
    
    // Get download URL
    const [downloadUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60 * 24 * 365 // 1 year
    });
    
    // 2. Extract data from PDF
    const extractionResult = await extractDataFromPDF(attachment.content);
    
    // 3. Create referral document
    const referralData: Partial<ChildReferral> = {
      id: referralId,
      
      // Default values - will be overridden by PDF extraction if successful
      age: 0,
      gender: 'male',
      ethnicity: 'Unknown',
      culturalBackground: 'Unknown',
      
      senNeeds: false,
      disabilities: [],
      behaviouralNeeds: false,
      behaviouralDetails: '',
      
      placementType: 'short-term',
      soloPlacementRequired: false,
      siblingGroup: false,
      petsAllowed: false,
      
      preferredLocations: [],
      excludedLocations: [],
      carerGenderPreference: null,
      
      supportNeeds: [],
      medicalNeeds: [],
      educationalNeeds: [],
      
      referralSource: emailData.from,
      referralDate: emailData.receivedAt,
      urgency: 'medium',
      
      status: extractionResult.success ? 'pending' : 'processing',
      attachmentUrl: downloadUrl,
      extractedData: extractionResult.success,
      
      matchedCarers: [],
      
      createdAt: new Date(),
      updatedAt: new Date(),
      statusHistory: [{
        from: '',
        to: extractionResult.success ? 'pending' : 'processing',
        timestamp: new Date(),
        changedBy: 'email-processor',
        reason: 'Initial referral processing',
        notes: extractionResult.success ? 'PDF data extracted successfully' : 'PDF extraction failed - manual review required'
      }]
    };
    
    // Override with extracted data if successful
    if (extractionResult.success && extractionResult.childData) {
      Object.assign(referralData, extractionResult.childData);
    }
    
    // Save to Firestore
    await db.collection('referrals').doc(referralId).set(referralData);
    
    // Create audit log
    await createAuditLog({
      entityType: 'referral',
      entityId: referralId,
      action: 'created',
      userId: 'system',
      userName: 'Email Processor',
      timestamp: new Date(),
      changes: {
        referralSource: emailData.from,
        extractedData: extractionResult.success,
        attachmentUrl: downloadUrl
      },
      notes: `Referral created from email: ${emailData.subject}`
    });
    
    console.log(`Created referral ${referralId} from PDF ${attachment.filename}`);
    
    // If extraction was successful, trigger matching
    if (extractionResult.success) {
      await triggerMatching(referralId);
    }
    
    return referralId;
    
  } catch (error) {
    console.error(`Error processing PDF ${attachment.filename}:`, error);
    
    // Create error referral document for manual review
    const errorReferralData: Partial<ChildReferral> = {
      id: referralId,
      age: 0,
      gender: 'male',
      ethnicity: 'Unknown',
      culturalBackground: 'Unknown',
      senNeeds: false,
      disabilities: [],
      behaviouralNeeds: false,
      behaviouralDetails: '',
      placementType: 'short-term',
      soloPlacementRequired: false,
      siblingGroup: false,
      petsAllowed: false,
      preferredLocations: [],
      excludedLocations: [],
      carerGenderPreference: null,
      supportNeeds: [],
      medicalNeeds: [],
      educationalNeeds: [],
      referralSource: emailData.from,
      referralDate: emailData.receivedAt,
      urgency: 'medium',
      status: 'processing',
      attachmentUrl: undefined,
      extractedData: false,
      matchedCarers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      statusHistory: [{
        from: '',
        to: 'processing',
        timestamp: new Date(),
        changedBy: 'email-processor',
        reason: 'Processing error',
        notes: `Error processing PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]
    };
    
    await db.collection('referrals').doc(referralId).set(errorReferralData);
    
    throw error;
  }
}

/**
 * Trigger matching process for a referral
 */
async function triggerMatching(referralId: string): Promise<void> {
  const db = admin.firestore();
  
  try {
    // Get referral data
    const referralDoc = await db.collection('referrals').doc(referralId).get();
    if (!referralDoc.exists) {
      throw new Error('Referral not found');
    }
    
    const referralData = referralDoc.data() as ChildReferral;
    
    // Get all active carers
    const carersSnapshot = await db.collection('carers')
      .where('status', '==', 'active')
      .get();
    
    const carers = carersSnapshot.docs.map(doc => doc.data() as any);
    
    // Import matching algorithm
    const { matchReferralToCarers } = await import('../matching/algorithm');
    
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
    await db.collection('referrals').doc(referralId).update({
      matchedCarers,
      status: 'matched',
      processedAt: new Date(),
      updatedAt: new Date(),
      statusHistory: admin.firestore.FieldValue.arrayUnion({
        from: 'pending',
        to: 'matched',
        timestamp: new Date(),
        changedBy: 'matching-system',
        reason: 'Automatic matching completed',
        notes: `Found ${matchedCarers.length} potential matches`
      })
    });
    
    // Create audit log
    await createAuditLog({
      entityType: 'referral',
      entityId: referralId,
      action: 'updated',
      userId: 'system',
      userName: 'Matching System',
      timestamp: new Date(),
      changes: {
        matchedCarers: matchedCarers.length,
        status: 'matched'
      },
      notes: 'Automatic matching completed'
    });
    
    console.log(`Matching completed for referral ${referralId}: ${matchedCarers.length} matches found`);
    
  } catch (error) {
    console.error(`Error triggering matching for referral ${referralId}:`, error);
    
    // Update referral status to indicate matching failed
    await db.collection('referrals').doc(referralId).update({
      status: 'processing',
      updatedAt: new Date(),
      statusHistory: admin.firestore.FieldValue.arrayUnion({
        from: 'pending',
        to: 'processing',
        timestamp: new Date(),
        changedBy: 'matching-system',
        reason: 'Matching failed',
        notes: `Matching error: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    });
  }
}

/**
 * Parse SendGrid inbound email webhook
 */
export function parseSendGridWebhook(body: any): ParsedEmailData {
  return {
    from: body.from,
    to: body.to,
    subject: body.subject,
    body: body.text || body.html || '',
    attachments: body.attachments ? body.attachments.map((att: any) => ({
      filename: att.filename,
      content: Buffer.from(att.content, 'base64'),
      contentType: att.type,
      size: att.content.length
    })) : [],
    receivedAt: new Date()
  };
}

/**
 * Parse Mailgun inbound email webhook
 */
export function parseMailgunWebhook(body: any, files: any): ParsedEmailData {
  const attachments: EmailAttachment[] = [];
  
  // Process file attachments
  if (files) {
    Object.keys(files).forEach(key => {
      const file = files[key];
      attachments.push({
        filename: file.name,
        content: file.data,
        contentType: file.mimetype,
        size: file.size
      });
    });
  }
  
  return {
    from: body.sender,
    to: body.recipient,
    subject: body.subject,
    body: body['body-plain'] || body['body-html'] || '',
    attachments,
    receivedAt: new Date()
  };
} 