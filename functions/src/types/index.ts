/**
 * Core data types for the Foster Care Agency application
 */

export interface CarerProfile {
  id: string;
  // Personal Information
  name: string;
  email: string;
  phone: string;
  
  // Placement Preferences
  minAge: number;
  maxAge: number;
  acceptsSiblings: boolean;
  allowsPets: boolean;
  
  // Experience and Capabilities
  experienceWithBehaviouralNeeds: boolean;
  experienceWithSEN: boolean; // Special Educational Needs
  
  // Location Preferences
  preferredLocation: string;
  excludedLocations: string[];
  
  // Additional Preferences
  genderPreference: 'male' | 'female' | null;
  capacity: number; // Number of children they can take
  
  // Status and Metadata
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // User ID who created the profile
  updatedBy: string; // User ID who last updated the profile
}

export interface ChildReferral {
  id: string;
  
  // Child Information
  age: number;
  gender: 'male' | 'female';
  ethnicity: string;
  culturalBackground: string;
  
  // Special Needs and Requirements
  senNeeds: boolean;
  disabilities: string[];
  behaviouralNeeds: boolean;
  behaviouralDetails: string;
  
  // Placement Requirements
  placementType: 'emergency' | 'short-term' | 'long-term' | 'respite';
  soloPlacementRequired: boolean;
  siblingGroup: boolean;
  siblingCount?: number;
  petsAllowed: boolean;
  
  // Location and Preferences
  preferredLocations: string[];
  excludedLocations: string[];
  carerGenderPreference: 'male' | 'female' | null;
  
  // Support and Care Requirements
  supportNeeds: string[];
  medicalNeeds: string[];
  educationalNeeds: string[];
  
  // Referral Metadata
  referralSource: string;
  referralDate: Date;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  
  // Processing Information
  status: 'pending' | 'processing' | 'matched' | 'placed' | 'declined' | 'closed';
  attachmentUrl?: string; // URL to the original IFA form PDF
  extractedData: boolean; // Whether PDF data extraction was successful
  
  // Matching Results
  matchedCarers: MatchedCarer[];
  assignedCarerId?: string;
  assignedAt?: Date;
  assignedBy?: string;
  
  // Audit Trail
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
  statusHistory: StatusChange[];
}

export interface MatchedCarer {
  carerId: string;
  carerName: string;
  score: number;
  matchDetails: MatchDetail[];
  recommended: boolean; // Top matches flagged as recommended
  contacted: boolean;
  contactedAt?: Date;
  response?: 'interested' | 'not_available' | 'declined';
  responseAt?: Date;
  notes?: string;
}

export interface MatchDetail {
  criterion: string;
  points: number;
  matched: boolean;
  details: string;
}

export interface StatusChange {
  from: string;
  to: string;
  timestamp: Date;
  changedBy: string;
  reason?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  entityType: 'carer' | 'referral';
  entityId: string;
  action: 'created' | 'updated' | 'deleted' | 'assigned' | 'status_changed';
  userId: string;
  userName: string;
  timestamp: Date;
  changes: Record<string, any>;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff' | 'manager';
  permissions: string[];
  active: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

// Email processing types
export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
  size: number;
}

export interface ParsedEmailData {
  from: string;
  to: string;
  subject: string;
  body: string;
  attachments: EmailAttachment[];
  receivedAt: Date;
}

export interface PDFExtractionResult {
  success: boolean;
  extractedText: string;
  childData?: Partial<ChildReferral>;
  errors?: string[];
}

// Matching algorithm types
export interface MatchingCriteria {
  ageRange: { weight: number; points: number };
  siblings: { weight: number; points: number };
  behavioural: { weight: number; points: number };
  location: { weight: number; points: number };
  sen: { weight: number; points: number };
  pets: { weight: number; points: number };
  capacity: { weight: number; points: number };
}

export interface MatchingResult {
  carerId: string;
  score: number;
  maxPossibleScore: number;
  matchDetails: MatchDetail[];
  recommended: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Firebase-specific types
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

// Configuration types
export interface EmailConfig {
  provider: 'sendgrid' | 'mailgun';
  apiKey: string;
  inboundDomain: string;
  webhookSecret?: string;
}

export interface AppConfig {
  email: EmailConfig;
  storage: {
    bucket: string;
    maxFileSize: number;
  };
  matching: MatchingCriteria;
} 