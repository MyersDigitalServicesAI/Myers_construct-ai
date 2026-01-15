# Myers Estimate Generator - Production Deployment Guide

## 1. Environment Configuration
This application requires several third-party services to function in a production environment. You must configure these keys in your deployment platform (Vercel, Netlify, Firebase Hosting) or a `.env` file for local development.

Create a `.env` file in the root directory:

```env
# Firebase Configuration (Authentication & Database)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# AI Service (Google Gemini)
# WARNING: In a true enterprise setup, this should be accessed via a backend proxy/Cloud Function
# to prevent exposing the key to the client.
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## 2. Service Dependencies

### Firebase (Auth & Firestore)
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Create a project.
3.  **Authentication:** Enable "Google" provider in the Sign-in method tab.
4.  **Firestore Database:** Create a database in "Production Mode".
    *   Set Rules to allow authenticated read/write:
        ```
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /users/{userId} {
              allow read, write: if request.auth != null && request.auth.uid == userId;
            }
            match /estimates/{estimateId} {
              allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
              allow create: if request.auth != null;
            }
          }
        }
        ```

### Stripe (Payments)
1.  Install the library: `npm install @stripe/stripe-js` (Already done).
2.  In `src/paymentService.ts`, replace `pk_live_placeholder` with your actual Stripe Publishable Key.
3.  **Backend Requirement:** Real payments require a backend to generate Stripe Checkout Sessions. The current implementation uses a secure simulation for demonstration.

## 3. Architecture Improvements Implemented
*   **Security:** Moved from LocalStorage to Firebase Auth & Firestore.
*   **Stability:** Refactored monolithic `App.tsx` into modular components.
*   **Safety:** Removed CDN dependencies for Stripe; implemented Zod schema validation for AI responses.
*   **Performance:** Added client-side image compression/validation (Max 4MB).

## 4. Build & Deploy
Run the following to build for production:
```bash
npm run build
```
The output will be in the `dist` folder, ready for static hosting.
