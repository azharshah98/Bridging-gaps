# Foster Care Agency Setup Guide

This guide will help you set up and deploy the Foster Care Agency web application.

## Prerequisites

- Node.js 18+ and npm
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project with the following services enabled:
  - Authentication
  - Firestore Database
  - Cloud Functions
  - Cloud Storage
  - Hosting (optional)

## Firebase Project Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable the following services:
   - **Authentication**: Enable Email/Password provider
   - **Firestore Database**: Create in production mode
   - **Cloud Functions**: Enable billing (required for external API calls)
   - **Cloud Storage**: Set up with default security rules
   - **Hosting**: (Optional) for deployment

### 2. Get Firebase Configuration

1. In Project Settings, find your web app configuration
2. Copy the config object
3. Update `frontend/src/firebase/config.ts` with your configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 3. Update API URLs

Update the API base URL in `frontend/src/services/api.ts`:

```typescript
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5001/your-project-id/us-central1/api'
  : 'https://us-central1-your-project-id.cloudfunctions.net/api';
```

## Installation

### 1. Install Dependencies

```bash
# Root dependencies
npm install

# Functions dependencies
cd functions
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### 2. Firebase Login

```bash
firebase login
firebase use your-project-id
```

## Database Setup

### 1. Deploy Firestore Rules and Indexes

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### 2. Create Initial User Data

Create an admin user in Firebase Auth, then add a corresponding document in Firestore:

**Collection: `users`**
**Document ID: `{user-uid}`**

```json
{
  "email": "admin@fostercare.com",
  "name": "System Administrator",
  "role": "admin",
  "permissions": ["read", "write", "admin"],
  "active": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 3. Sample Data (Optional)

You can add sample carer profiles and referrals for testing:

**Collection: `carers`**

```json
{
  "name": "John and Jane Smith",
  "email": "smith@example.com",
  "phone": "+44 1234 567890",
  "minAge": 5,
  "maxAge": 16,
  "acceptsSiblings": true,
  "allowsPets": false,
  "experienceWithBehaviouralNeeds": true,
  "experienceWithSEN": false,
  "preferredLocation": "London",
  "excludedLocations": [],
  "genderPreference": null,
  "capacity": 2,
  "status": "active",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "createdBy": "system",
  "updatedBy": "system"
}
```

## Email Integration Setup

### Option 1: SendGrid

1. Create a SendGrid account
2. Set up Inbound Parse webhook pointing to:
   `https://us-central1-your-project-id.cloudfunctions.net/api/webhook/sendgrid`
3. Add your API key to Functions environment:

```bash
firebase functions:config:set sendgrid.api_key="your-sendgrid-api-key"
```

### Option 2: Mailgun

1. Create a Mailgun account
2. Set up inbound routing to:
   `https://us-central1-your-project-id.cloudfunctions.net/api/webhook/mailgun`
3. Add your API key to Functions environment:

```bash
firebase functions:config:set mailgun.api_key="your-mailgun-api-key"
```

## Development

### 1. Start Firebase Emulators (Optional)

```bash
firebase emulators:start
```

### 2. Start Development Servers

In separate terminals:

```bash
# Start Functions development server
cd functions
npm run serve

# Start React development server
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Functions: http://localhost:5001

## Production Deployment

### 1. Build Frontend

```bash
cd frontend
npm run build
```

### 2. Deploy to Firebase

```bash
# Deploy everything
firebase deploy

# Or deploy specific services
firebase deploy --only functions
firebase deploy --only hosting
firebase deploy --only firestore:rules
```

## Environment Variables

### Functions Environment Variables

```bash
# Email service configuration
firebase functions:config:set email.provider="sendgrid"
firebase functions:config:set email.api_key="your-api-key"
firebase functions:config:set email.webhook_secret="your-webhook-secret"

# Storage configuration
firebase functions:config:set storage.bucket="your-project.appspot.com"
firebase functions:config:set storage.max_file_size="10485760"
```

### Frontend Environment Variables

Create `frontend/.env.local`:

```
REACT_APP_API_BASE_URL=https://us-central1-your-project-id.cloudfunctions.net/api
```

## Security Checklist

- [ ] Firestore security rules deployed and tested
- [ ] Storage security rules deployed and tested
- [ ] Firebase Auth configured with email/password only
- [ ] Admin user created and tested
- [ ] API endpoints require authentication
- [ ] Sensitive data is not exposed in client code
- [ ] CORS is properly configured for your domain
- [ ] Email webhook endpoints are secured

## Testing

### 1. Test Authentication

1. Try logging in with admin credentials
2. Verify role-based access control
3. Test logout functionality

### 2. Test Email Processing

1. Send a test email with PDF attachment to your configured email
2. Check Cloud Functions logs for processing
3. Verify referral creation in Firestore

### 3. Test Matching Algorithm

1. Create test carer profiles
2. Create test referrals
3. Verify matching results

## Monitoring and Maintenance

### 1. Set up Monitoring

- Enable Firebase Performance Monitoring
- Set up Cloud Function error reporting
- Monitor Firestore usage and costs

### 2. Regular Maintenance

- Review audit logs regularly
- Update dependencies monthly
- Monitor email processing success rates
- Review and update matching criteria as needed

## Troubleshooting

### Common Issues

1. **Functions deployment fails**
   - Check Node.js version (must be 18+)
   - Verify billing is enabled
   - Check function timeout settings

2. **Email processing not working**
   - Verify webhook URLs are correct
   - Check email service configuration
   - Review Cloud Functions logs

3. **Authentication issues**
   - Verify Firebase config is correct
   - Check user document exists in Firestore
   - Verify security rules allow access

4. **Matching algorithm not working**
   - Check carer profiles have required fields
   - Verify referral data is complete
   - Review matching criteria configuration

### Getting Help

- Check Firebase documentation
- Review Cloud Functions logs in Firebase Console
- Use Firebase support channels
- Check GitHub issues for known problems

## Performance Optimization

1. **Firestore Optimization**
   - Use composite indexes for complex queries
   - Implement pagination for large datasets
   - Cache frequently accessed data

2. **Functions Optimization**
   - Increase memory allocation for PDF processing
   - Use connection pooling for external APIs
   - Implement proper error handling and retries

3. **Frontend Optimization**
   - Implement lazy loading for routes
   - Use React.memo for expensive components
   - Optimize bundle size with code splitting

## Backup and Recovery

1. **Firestore Backup**
   - Set up automated daily backups
   - Test restore procedures
   - Document backup retention policy

2. **Code Backup**
   - Use version control (Git)
   - Tag releases
   - Maintain deployment documentation

3. **Configuration Backup**
   - Export Firebase project configuration
   - Document environment variables
   - Maintain security rules in version control 