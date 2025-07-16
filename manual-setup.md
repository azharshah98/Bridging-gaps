# Manual Firestore Database Setup

Since the automated scripts require additional authentication setup, here's how to manually populate your Firestore database:

## Step 1: Go to Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com/project/carer-match/firestore)
2. Navigate to Firestore Database

## Step 2: Create Collections and Documents

### 1. Create `users` Collection

**Collection ID:** `users`

**Document ID:** `qW2qFpHjKOhAThdSWmpv8I1xJ7j1`

**Fields to add:**
```
email: "traderaz@hotmail.com" (string)
name: "System Administrator" (string)
role: "admin" (string)
permissions: ["read", "write", "admin"] (array)
active: true (boolean)
createdAt: January 1, 2024 at 12:00:00 AM UTC (timestamp)
updatedAt: January 1, 2024 at 12:00:00 AM UTC (timestamp)
lastLogin: null
```

### 2. Create `carers` Collection

**Collection ID:** `carers`

**Document ID:** `carer-001` (or auto-generate)

**Fields to add:**
```
name: "John and Jane Smith" (string)
email: "smith@example.com" (string)
phone: "+44 1234 567890" (string)
address: (map)
  ├── street: "123 Main Street" (string)
  ├── city: "London" (string)
  ├── postcode: "SW1A 1AA" (string)
  └── region: "London" (string)
preferences: (map)
  ├── ageRange: (map)
  │   ├── min: 5 (number)
  │   └── max: 16 (number)
  ├── acceptsSiblings: true (boolean)
  ├── allowsPets: false (boolean)
  ├── genderPreference: null
  ├── placementTypes: ["short-term", "long-term"] (array)
  ├── preferredLocations: ["London", "Surrey"] (array)
  └── excludedLocations: ["Scotland"] (array)
experience: (map)
  ├── yearsOfExperience: 5 (number)
  ├── experienceWithBehaviouralNeeds: true (boolean)
  ├── experienceWithSEN: false (boolean)
  ├── experienceWithDisabilities: ["autism", "adhd"] (array)
  ├── previousPlacements: 12 (number)
  └── specializations: ["teenagers", "sibling-groups"] (array)
availability: (map)
  ├── status: "active" (string)
  ├── currentCapacity: 2 (number)
  ├── maxCapacity: 2 (number)
  ├── availableFrom: January 1, 2024 at 12:00:00 AM UTC (timestamp)
  ├── temporaryUnavailable: false (boolean)
  ├── unavailableReason: null
  └── unavailableUntil: null
safeguarding: (map)
  ├── dbsCheck: (map)
  │   ├── status: "valid" (string)
  │   ├── expiryDate: December 31, 2024 at 12:00:00 AM UTC (timestamp)
  │   └── certificateNumber: "DBS123456789" (string)
  └── training: (map)
      ├── safeguardingLevel: "level-2" (string)
      ├── lastTrainingDate: January 1, 2024 at 12:00:00 AM UTC (timestamp)
      └── nextTrainingDue: January 1, 2025 at 12:00:00 AM UTC (timestamp)
status: "active" (string)
createdAt: January 1, 2024 at 12:00:00 AM UTC (timestamp)
updatedAt: January 1, 2024 at 12:00:00 AM UTC (timestamp)
createdBy: "qW2qFpHjKOhAThdSWmpv8I1xJ7j1" (string)
updatedBy: "qW2qFpHjKOhAThdSWmpv8I1xJ7j1" (string)
```

### 3. Create Second Carer (Optional)

**Document ID:** `carer-002` (or auto-generate)

**Fields to add:**
```
name: "Sarah Johnson" (string)
email: "sarah.johnson@example.com" (string)
phone: "+44 1234 567891" (string)
address: (map)
  ├── street: "456 Oak Avenue" (string)
  ├── city: "Manchester" (string)
  ├── postcode: "M1 2AB" (string)
  └── region: "Manchester" (string)
preferences: (map)
  ├── ageRange: (map)
  │   ├── min: 8 (number)
  │   └── max: 18 (number)
  ├── acceptsSiblings: false (boolean)
  ├── allowsPets: true (boolean)
  ├── genderPreference: "female" (string)
  ├── placementTypes: ["long-term", "emergency"] (array)
  ├── preferredLocations: ["Manchester", "Liverpool"] (array)
  └── excludedLocations: ["London"] (array)
experience: (map)
  ├── yearsOfExperience: 8 (number)
  ├── experienceWithBehaviouralNeeds: false (boolean)
  ├── experienceWithSEN: true (boolean)
  ├── experienceWithDisabilities: ["dyslexia", "autism"] (array)
  ├── previousPlacements: 6 (number)
  └── specializations: ["SEN", "teenagers"] (array)
availability: (map)
  ├── status: "active" (string)
  ├── currentCapacity: 1 (number)
  ├── maxCapacity: 1 (number)
  ├── availableFrom: January 1, 2024 at 12:00:00 AM UTC (timestamp)
  ├── temporaryUnavailable: false (boolean)
  ├── unavailableReason: null
  └── unavailableUntil: null
safeguarding: (map)
  ├── dbsCheck: (map)
  │   ├── status: "valid" (string)
  │   ├── expiryDate: December 31, 2024 at 12:00:00 AM UTC (timestamp)
  │   └── certificateNumber: "DBS987654321" (string)
  └── training: (map)
      ├── safeguardingLevel: "level-3" (string)
      ├── lastTrainingDate: January 1, 2024 at 12:00:00 AM UTC (timestamp)
      └── nextTrainingDue: January 1, 2025 at 12:00:00 AM UTC (timestamp)
status: "active" (string)
createdAt: January 1, 2024 at 12:00:00 AM UTC (timestamp)
updatedAt: January 1, 2024 at 12:00:00 AM UTC (timestamp)
createdBy: "qW2qFpHjKOhAThdSWmpv8I1xJ7j1" (string)
updatedBy: "qW2qFpHjKOhAThdSWmpv8I1xJ7j1" (string)
```

### 4. Create `referrals` Collection (Optional)

**Collection ID:** `referrals`

**Document ID:** `referral-001` (or auto-generate)

**Fields to add:**
```
childName: "Child A" (string)
age: 12 (number)
gender: "male" (string)
ethnicity: "White British" (string)
culturalBackground: "British" (string)
referringAgency: "Local Authority" (string)
referralSource: "socialworker@council.gov.uk" (string)
referralDate: January 1, 2024 at 12:00:00 AM UTC (timestamp)
urgency: "high" (string)
needs: (map)
  ├── senNeeds: true (boolean)
  ├── senDetails: "Dyslexia support required" (string)
  ├── disabilities: ["dyslexia"] (array)
  ├── behaviouralNeeds: false (boolean)
  ├── behaviouralDetails: "" (string)
  ├── medicalNeeds: ["regular medication"] (array)
  ├── educationalNeeds: ["SEN support", "1-to-1 teaching assistant"] (array)
  └── therapeuticNeeds: ["counselling"] (array)
placement: (map)
  ├── placementType: "long-term" (string)
  ├── duration: "12+ months" (string)
  ├── soloPlacementRequired: false (boolean)
  ├── siblingGroup: false (boolean)
  ├── siblingCount: 0 (number)
  ├── petsAllowed: true (boolean)
  ├── preferredLocations: ["London", "Surrey"] (array)
  ├── excludedLocations: ["Scotland"] (array)
  ├── carerGenderPreference: null
  └── specialRequirements: ["pet-friendly", "experienced-with-SEN"] (array)
status: "pending" (string)
extractedData: false (boolean)
matchedCarers: [] (array)
assignedCarer: null
assignedAt: null
assignedBy: null
createdAt: January 1, 2024 at 12:00:00 AM UTC (timestamp)
updatedAt: January 1, 2024 at 12:00:00 AM UTC (timestamp)
createdBy: "qW2qFpHjKOhAThdSWmpv8I1xJ7j1" (string)
updatedBy: "qW2qFpHjKOhAThdSWmpv8I1xJ7j1" (string)
```

## Step 3: Create Firebase Auth User

1. Go to [Firebase Console - Authentication](https://console.firebase.google.com/project/carer-match/authentication/users)
2. Click "Add user"
3. Enter:
   - **Email:** `traderaz@hotmail.com`
   - **Password:** Choose a secure password
4. **IMPORTANT:** Copy the generated UID and make sure it matches `qW2qFpHjKOhAThdSWmpv8I1xJ7j1` in your users collection
   - If the UID is different, update the document ID in the users collection to match

## Step 4: Test the Setup

1. Navigate to your frontend: `cd frontend`
2. Start the development server: `npm run dev`
3. Open http://localhost:3000
4. Try logging in with:
   - **Email:** `traderaz@hotmail.com`
   - **Password:** (the password you set in Firebase Auth)

## Troubleshooting

- If login fails, check that the UID in Firestore matches the UID in Firebase Auth
- If you get permission errors, make sure the Firestore rules are deployed: `firebase deploy --only firestore:rules`
- If you can't see data, check that the user document exists in the `users` collection

## Quick Commands

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Start frontend development server
cd frontend && npm run dev

# Start backend functions (if needed)
cd functions && npm run serve
```

## What You'll Have After Setup

- ✅ Admin user account (traderaz@hotmail.com)
- ✅ 2 sample carer profiles
- ✅ 1 sample referral
- ✅ Working authentication
- ✅ Deployed security rules

You can now use the web interface to add more carers, referrals, and test the matching functionality! 