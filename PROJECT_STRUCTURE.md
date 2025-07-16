# Foster Care Management System - Project Structure

## 📁 Clean Project Organization

```
foster-care-agency/
├── 📄 firebase.json              # Firebase configuration
├── 📄 .firebaserc               # Firebase project settings
├── 📄 firestore.rules           # Firestore security rules
├── 📄 firestore.indexes.json    # Firestore database indexes
├── 📄 storage.rules             # Firebase Storage security rules
├── 📄 .gitignore               # Git ignore patterns
├── 📄 README.md                # Project documentation
├── 📄 SETUP.md                 # Setup instructions
├── 📄 FIRESTORE_SCHEMA.md      # Database schema documentation
├── 📄 PROJECT_STRUCTURE.md     # This file
├── 📄 manual-setup.md          # Manual setup guide
│
├── 📁 frontend/                # React/Next.js frontend application
│   ├── 📄 package.json        # Frontend dependencies
│   ├── 📄 next.config.js      # Next.js configuration
│   ├── 📄 tailwind.config.js  # Tailwind CSS configuration
│   ├── 📁 pages/              # Next.js pages
│   ├── 📁 components/         # React components
│   ├── 📁 lib/                # Utility libraries
│   ├── 📁 styles/             # CSS styles
│   └── 📁 public/             # Static assets
│
├── 📁 functions/              # Firebase Cloud Functions (backend)
│   ├── 📄 package.json       # Backend dependencies
│   ├── 📄 tsconfig.json      # TypeScript configuration
│   ├── 📁 src/               # TypeScript source code
│   │   ├── 📄 index.ts       # Main functions entry point
│   │   ├── 📁 email/         # Email processing modules
│   │   ├── 📁 matching/      # Matching algorithm
│   │   ├── 📁 utils/         # Utility functions
│   │   └── 📁 types/         # TypeScript type definitions
│   └── 📁 lib/               # Compiled JavaScript (auto-generated)
│
└── 📁 scripts/               # Setup and utility scripts
    └── 📄 setup-database.js  # Database initialization script
```

## 🎯 Key Principles

### ✅ What SHOULD be in root directory:
- Firebase configuration files
- Project documentation
- Git configuration
- Database rules and schemas

### ❌ What should NOT be in root directory:
- `node_modules/` (belongs in frontend/ and functions/)
- `package.json` (belongs in frontend/ and functions/)
- Test scripts (belongs in scripts/ or tests/)
- Temporary files

### 📦 Dependencies Management:
- **Frontend**: `cd frontend && npm install`
- **Backend**: `cd functions && npm install`
- **No root dependencies** - each module manages its own

### 🔧 Development Commands:
```bash
# Start frontend development server
cd frontend && npm run dev

# Start backend functions emulator
cd functions && firebase emulators:start --only functions

# Deploy to Firebase
firebase deploy

# Setup database (one-time)
cd scripts && node setup-database.js
```

## 📋 Current Status

✅ **Cleaned up root directory**
✅ **Organized scripts into scripts/ folder**
✅ **Fixed TypeScript compilation errors**
✅ **Proper project structure**
✅ **Clear separation of concerns**

## 🚀 Next Steps

1. **Start functions emulator**: `cd functions && firebase emulators:start --only functions`
2. **Start frontend**: `cd frontend && npm run dev`
3. **Test full stack**: Login and create carers/referrals
4. **Verify Firestore**: Check data appears in Firebase console 