# Foster Care Agency Web App

A streamlined web application for foster care agencies focused on core matching functionality between carers and child referrals.

## 🚀 Features

- **Foster Carer Management**: Store and manage detailed carer profiles with preferences and capabilities
- **Automated Referral Processing**: Receive and process IFA referral forms via email with PDF parsing
- **Intelligent Matching**: Algorithm-based matching system that scores carers against referral requirements
- **Carer Assignment**: Assign matched carers to referrals with tracking
- **Daily Summary**: View daily referrals summary and key statistics
- **Secure Dashboard**: React-based dashboard for agency staff with role-based access
- **Audit Logging**: Complete audit trail of all actions and status changes

## 🛠️ Tech Stack

- **Backend**: Firebase Cloud Functions (Node.js/TypeScript)
- **Database**: Firestore (NoSQL)
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Frontend**: React with Next.js and Tailwind CSS
- **Email Processing**: SendGrid/Mailgun integration
- **PDF Processing**: PDF-parse library

## 📁 Project Structure

```
foster-care-agency/
├── functions/              # Firebase Cloud Functions
│   ├── src/
│   │   ├── index.ts       # Main functions entry point
│   │   ├── matching/      # Matching algorithm
│   │   ├── email/         # Email processing
│   │   └── types/         # TypeScript definitions
│   ├── package.json
│   └── tsconfig.json
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # Firebase services
│   │   └── types/         # TypeScript definitions
│   └── package.json
├── firestore.rules        # Firestore security rules
├── storage.rules          # Storage security rules
├── firebase.json          # Firebase configuration
└── package.json           # Root package.json
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+
- Firebase CLI
- Firebase project with Firestore, Auth, Storage, and Functions enabled

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   cd functions && npm install
   cd ../frontend && npm install
   ```

2. **Firebase Setup**
   ```bash
   firebase login
   firebase init
   # Select your Firebase project
   ```

3. **Environment Configuration**
   - Create `functions/.env` with your email service credentials
   - Update `frontend/src/firebase/config.ts` with your Firebase config

4. **Deploy Security Rules**
   ```bash
   firebase deploy --only firestore:rules,storage
   ```

5. **Start Development**
   ```bash
   npm run dev
   ```

### Production Deployment

```bash
npm run build
firebase deploy
```

## 🔐 Security Features

- Firebase Auth for staff authentication
- Firestore security rules preventing unauthorized access
- Storage rules protecting sensitive attachments
- Audit logging for compliance
- Input validation and sanitization

## 📊 Data Models

### Carer Profile
- Personal information and contact details
- Age range preferences and capacity
- Experience with special needs and behavioral issues
- Location preferences and exclusions
- Pet and sibling group preferences

### Referral
- Child information and needs assessment
- Placement requirements and preferences
- Extracted data from IFA forms
- Matched carers with scoring (only shows carers with score > 0)
- Assignment tracking and audit trail

## 🎯 Matching Algorithm

The system uses a weighted scoring algorithm that considers:
- Age range compatibility (30 points)
- Sibling group acceptance (20 points)  
- Special needs experience (15 points)
- Behavioral support experience (15 points)
- Location preferences (10 points)
- Urgency level (10 points)

**Note**: Only carers with a match score greater than 0 are displayed in the matching results.

## 📝 License

MIT License - See LICENSE file for details 