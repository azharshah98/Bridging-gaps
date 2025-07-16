# Foster Care Matching System

A comprehensive web application for matching foster carers with children in need of care, built with React/Next.js and Firebase.

## Features

- **Intelligent Matching Algorithm**: Automatically matches carers with children based on multiple criteria
- **Carer Management**: Complete CRUD operations for foster carer profiles
- **Referral Processing**: Streamlined referral intake and processing
- **Real-time Updates**: Live updates using Firebase Firestore
- **Secure Authentication**: Firebase Authentication with role-based access
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Tech Stack

- **Frontend**: React, Next.js, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Cloud Functions)
- **Deployment**: Vercel (Frontend), Firebase (Backend)

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/azharshah98/Bridging-gaps.git
   cd Bridging-gaps
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the frontend directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id_here
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Production Deployment

### Vercel Deployment

1. **Connect to Vercel**
   - Import your GitHub repository to Vercel
   - Select the `frontend` directory as the root directory

2. **Configure Environment Variables**
   In your Vercel dashboard, add these environment variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDykPup22rjrnfgDak2diZtI9jBYsISi3w
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=carer-match.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=carer-match
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=carer-match.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=922161902973
   NEXT_PUBLIC_FIREBASE_APP_ID=1:922161902973:web:aefae248a86fe92348c814
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-19236LK34J
   ```

3. **Deploy**
   - Vercel will automatically deploy when you push to your main branch
   - The build command and output directory are pre-configured in `vercel.json`

### Firebase Backend Deployment

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Deploy Firebase Functions**
   ```bash
   cd functions
   firebase deploy --only functions
   ```

3. **Deploy Firestore Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

## Environment Variables for Production

When deploying to Vercel, you'll need to set these environment variables in your Vercel dashboard:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyDykPup22rjrnfgDak2diZtI9jBYsISi3w` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `carer-match.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `carer-match` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `carer-match.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `922161902973` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:922161902973:web:aefae248a86fe92348c814` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-19236LK34J` |

## Security Features

- Content Security Policy headers
- XSS protection
- Frame options for clickjacking protection
- HTTPS enforcement
- Firebase security rules
- Input validation and sanitization

## Project Structure

```
├── frontend/                 # Next.js frontend application
│   ├── components/          # React components
│   ├── pages/              # Next.js pages and API routes
│   ├── lib/                # Utility functions and Firebase config
│   ├── styles/             # CSS and styling
│   └── public/             # Static assets
├── functions/              # Firebase Cloud Functions
├── firestore.rules         # Firestore security rules
├── storage.rules          # Firebase Storage rules
└── scripts/               # Setup and utility scripts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team. 