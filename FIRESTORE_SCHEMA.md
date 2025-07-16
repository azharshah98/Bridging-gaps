# Firestore Database Schema

This document defines the complete Firestore database schema for the Foster Care Agency Management System.

## Collections Overview

- `users` - Agency staff user accounts
- `carers` - Foster carer profiles
- `referrals` - Child referral records
- `audit_logs` - System audit trail

---

## Collection: `users`

**Purpose**: Store agency staff user accounts with role-based access control

**Security**: Only admins can create/modify users. Users can read their own profile.

```json
{
  "id": "firebase-auth-uid",
  "email": "admin@fostercare.com",
  "name": "John Smith",
  "role": "admin",
  "permissions": ["read", "write", "admin"],
  "active": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "lastLogin": "2024-01-01T00:00:00Z"
}
```

**Roles**:
- `admin` - Full system access
- `manager` - Can manage carers and referrals
- `staff` - Read-only access

---

## Collection: `carers`

**Purpose**: Store foster carer profiles with preferences and capabilities

**Security**: Staff can read, managers/admins can write

```json
{
  "id": "carer-uuid",
  "name": "John and Jane Smith",
  "email": "smith@example.com",
  "phone": "+44 1234 567890",
  "address": {
    "street": "123 Main Street",
    "city": "London",
    "postcode": "SW1A 1AA",
    "region": "London"
  },
  "preferences": {
    "ageRange": {
      "min": 5,
      "max": 16
    },
    "acceptsSiblings": true,
    "allowsPets": false,
    "genderPreference": null,
    "placementTypes": ["short-term", "long-term"],
    "preferredLocations": ["London", "Surrey"],
    "excludedLocations": ["Scotland"]
  },
  "experience": {
    "yearsOfExperience": 5,
    "experienceWithBehaviouralNeeds": true,
    "experienceWithSEN": false,
    "experienceWithDisabilities": ["autism", "adhd"],
    "previousPlacements": 12,
    "specializations": ["teenagers", "sibling-groups"]
  },
  "availability": {
    "status": "active",
    "currentCapacity": 2,
    "maxCapacity": 2,
    "availableFrom": "2024-01-01T00:00:00Z",
    "temporaryUnavailable": false,
    "unavailableReason": null,
    "unavailableUntil": null
  },
  "safeguarding": {
    "dbsCheck": {
      "status": "valid",
      "expiryDate": "2024-12-31T00:00:00Z",
      "certificateNumber": "DBS123456789"
    },
    "training": {
      "safeguardingLevel": "level-2",
      "lastTrainingDate": "2024-01-01T00:00:00Z",
      "nextTrainingDue": "2025-01-01T00:00:00Z"
    }
  },
  "status": "active",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "createdBy": "user-id",
  "updatedBy": "user-id"
}
```

**Status Values**:
- `active` - Available for placements
- `inactive` - Not available
- `pending` - Awaiting approval

---

## Collection: `referrals`

**Purpose**: Store child referral records with matching results

**Security**: Staff can read, managers/admins can write

```json
{
  "id": "referral-uuid",
  "childName": "Child A",
  "age": 12,
  "gender": "male",
  "ethnicity": "White British",
  "culturalBackground": "British",
  "referringAgency": "Local Authority",
  "referralSource": "socialworker@council.gov.uk",
  "referralDate": "2024-01-01T00:00:00Z",
  "urgency": "high",
  "needs": {
    "senNeeds": true,
    "senDetails": "Dyslexia support required",
    "disabilities": ["dyslexia"],
    "behaviouralNeeds": false,
    "behaviouralDetails": "",
    "medicalNeeds": ["regular medication"],
    "educationalNeeds": ["SEN support", "1-to-1 teaching assistant"],
    "therapeuticNeeds": ["counselling"]
  },
  "placement": {
    "placementType": "long-term",
    "duration": "12+ months",
    "soloPlacementRequired": false,
    "siblingGroup": false,
    "siblingCount": 0,
    "petsAllowed": true,
    "preferredLocations": ["London", "Surrey"],
    "excludedLocations": ["Scotland"],
    "carerGenderPreference": null,
    "specialRequirements": ["pet-friendly", "experienced-with-SEN"]
  },
  "status": "matched",
  "extractedData": true,
  "attachmentUrl": "https://storage.googleapis.com/...",
  "matchedCarers": [
    {
      "carerId": "carer-uuid",
      "carerName": "John and Jane Smith",
      "score": 85,
      "matchDetails": {
        "ageRange": 30,
        "siblings": 0,
        "specialNeeds": 15,
        "behavioural": 0,
        "location": 15,
        "urgency": 10,
        "pets": 5,
        "capacity": 5,
        "total": 85
      },
      "recommended": true,
      "contacted": false,
      "contactedAt": null,
      "response": null
    }
  ],
  "assignedCarer": null,
  "assignedAt": null,
  "assignedBy": null,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "statusHistory": [
    {
      "from": "",
      "to": "pending",
      "timestamp": "2024-01-01T00:00:00Z",
      "changedBy": "email-processor",
      "reason": "Initial referral processing",
      "notes": "PDF data extracted successfully"
    }
  ]
}
```

**Status Values**:
- `received` - Just received, processing
- `processing` - PDF extraction in progress
- `pending` - Ready for matching
- `matched` - Matched with carers
- `assigned` - Assigned to specific carer
- `closed` - Referral closed

**Urgency Levels**:
- `low` - Standard processing
- `medium` - Expedited processing
- `high` - Priority processing
- `urgent` - Emergency placement



---

## Collection: `audit_logs`

**Purpose**: Complete audit trail of all system actions

**Security**: Read-only for staff, write-only for system

```json
{
  "id": "audit-log-uuid",
  "entityType": "referral",
  "entityId": "referral-uuid",
  "action": "created",
  "userId": "user-id",
  "userName": "John Smith",
  "userRole": "admin",
  "timestamp": "2024-01-01T00:00:00Z",
  "changes": {
    "field": "status",
    "oldValue": "pending",
    "newValue": "matched",
    "additionalData": {
      "matchCount": 3,
      "topScore": 85
    }
  },
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "notes": "Automatic matching completed successfully"
}
```

**Action Types**:
- `created` - Record created
- `updated` - Record modified
- `deleted` - Record deleted
- `viewed` - Record accessed
- `assigned` - Assignment made
- `matched` - Matching performed

---

## Indexes

**Required Firestore indexes for optimal performance**:

### Carers Collection
```json
{
  "collectionGroup": "carers",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "preferences.ageRange.min", "order": "ASCENDING" }
  ]
}
```

### Referrals Collection
```json
{
  "collectionGroup": "referrals",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

### Audit Logs Collection
```json
{
  "collectionGroup": "audit_logs",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "entityType", "order": "ASCENDING" },
    { "fieldPath": "timestamp", "order": "DESCENDING" }
  ]
}
```

---

## Security Rules Summary

- **Authentication Required**: All operations require valid Firebase Auth token
- **Role-based Access**: Admin > Manager > Staff hierarchy
- **Data Validation**: All writes validated against schema
- **Audit Trail**: All modifications logged automatically
- **Sensitive Data**: Personal information protected with appropriate access controls

---

## Data Retention Policy

- **Permanent Storage**: All referrals and carer data retained permanently
- **Audit Logs**: Retained for 7 years minimum
- **Soft Deletion**: Records marked as deleted but not physically removed
- **Compliance**: Meets GDPR and UK data protection requirements 