/**
 * Audit Logging Utility
 * 
 * Provides functions to create and manage audit logs for all system actions
 * Ensures compliance and traceability of all data changes
 */

import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { AuditLog } from '../types';

/**
 * Create an audit log entry
 */
export async function createAuditLog(logData: Omit<AuditLog, 'id'>): Promise<string> {
  const db = admin.firestore();
  const logId = uuidv4();
  
  const auditLog: AuditLog = {
    id: logId,
    ...logData
  };
  
  try {
    // Use admin privileges to write audit log (bypasses security rules)
    await db.collection('audit_logs').doc(logId).set(auditLog);
    console.log(`Audit log created: ${logId}`);
    return logId;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    throw error;
  }
}

/**
 * Log carer profile changes
 */
export async function logCarerChange(
  carerId: string,
  action: 'created' | 'updated' | 'deleted',
  userId: string,
  userName: string,
  changes: Record<string, any>,
  notes?: string
): Promise<string> {
  return createAuditLog({
    entityType: 'carer',
    entityId: carerId,
    action,
    userId,
    userName,
    timestamp: new Date(),
    changes,
    notes
  });
}

/**
 * Log referral changes
 */
export async function logReferralChange(
  referralId: string,
  action: 'created' | 'updated' | 'assigned' | 'status_changed',
  userId: string,
  userName: string,
  changes: Record<string, any>,
  notes?: string
): Promise<string> {
  return createAuditLog({
    entityType: 'referral',
    entityId: referralId,
    action,
    userId,
    userName,
    timestamp: new Date(),
    changes,
    notes
  });
}

/**
 * Get audit logs for a specific entity
 */
export async function getAuditLogs(
  entityType: 'carer' | 'referral',
  entityId: string,
  limit: number = 50
): Promise<AuditLog[]> {
  const db = admin.firestore();
  
  try {
    const snapshot = await db.collection('audit_logs')
      .where('entityType', '==', entityType)
      .where('entityId', '==', entityId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => doc.data() as AuditLog);
  } catch (error) {
    console.error('Failed to get audit logs:', error);
    throw error;
  }
}

/**
 * Get audit logs for a specific user
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50
): Promise<AuditLog[]> {
  const db = admin.firestore();
  
  try {
    const snapshot = await db.collection('audit_logs')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => doc.data() as AuditLog);
  } catch (error) {
    console.error('Failed to get user audit logs:', error);
    throw error;
  }
}

/**
 * Get recent audit logs
 */
export async function getRecentAuditLogs(
  limit: number = 100
): Promise<AuditLog[]> {
  const db = admin.firestore();
  
  try {
    const snapshot = await db.collection('audit_logs')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => doc.data() as AuditLog);
  } catch (error) {
    console.error('Failed to get recent audit logs:', error);
    throw error;
  }
}

/**
 * Search audit logs by action type
 */
export async function getAuditLogsByAction(
  action: 'created' | 'updated' | 'deleted' | 'assigned' | 'status_changed',
  limit: number = 50
): Promise<AuditLog[]> {
  const db = admin.firestore();
  
  try {
    const snapshot = await db.collection('audit_logs')
      .where('action', '==', action)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => doc.data() as AuditLog);
  } catch (error) {
    console.error('Failed to get audit logs by action:', error);
    throw error;
  }
} 