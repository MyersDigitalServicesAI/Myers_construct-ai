# Myers Construct AI - Production Deployment Guide

## 🚀 Quick Start - Production Ready Checklist

This guide will help you deploy Myers Construct AI to production with all necessary configurations.

---

## 📋 Prerequisites

- ✅ Node.js 18+ installed
- ✅ npm or yarn package manager
- ✅ Git installed
- ✅ Vercel CLI (optional): `npm i -g vercel`
- ✅ Firebase CLI (optional): `npm i -g firebase-tools`

---

## 🔑 Step 1: Environment Variables Setup

### 1.1 Get Your API Keys

#### Gemini AI API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy your API key

#### Stripe Keys (Production)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Toggle to "Live" mode (not Test mode)
3. Copy your **Publishable key** (starts with `pk_live_`)
4. Copy your **Secret key** (starts with `sk_live_`)
5. Set up webhooks: [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
   - Add endpoint: `https://your-domain.com/api/stripe-webhook`
   - Select events: `payment_intent.succeeded`, `checkout.session.completed`
   - Copy the webhook signing secret (starts with `whsec_`)

#### Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project or create a new one
3. Go to Project Settings > General
4. Scroll to "Your apps" section
5. Copy all the config values

### 1.2 Configure Environment Variables

Update your `.env.local` file with real values:

```bash
cp .env.example .env.local
# Edit .env.local with your actual keys
```

Replace ALL placeholder values with your actual keys!

---

## 🛠️ Step 2: Update Application Code

### 2.1 Update Firebase Database Service (dbService.ts)

Replace the localStorage implementation with Firebase:


```typescript
// dbService.ts - Production Firebase Version
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { EstimateResult, ProjectData } from './types';

export const saveEstimate = async (estimate: EstimateResult): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'estimates'), {
      ...estimate,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving estimate:', error);
    throw new Error('Failed to save estimate');
  }
};

export const getEstimates = async (): Promise<EstimateResult[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'estimates'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EstimateResult));
  } catch (error) {
    console.error('Error getting estimates:', error);
    throw new Error('Failed to retrieve estimates');
  }
};
```

### 2.2 Update Payment Service

Ensure Stripe uses live keys in production.

---

## 🌐 Step 3: Deploy to Vercel

### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Option B: Deploy via GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

### 3.1 Add Environment Variables in Vercel

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add ALL variables from your `.env.local`
4. Click "Save"

---

## 🔥 Step 4: Configure Firebase

### 4.1 Set Up Firestore Database

1. Go to Firebase Console
2. Click "Firestore Database"
3. Create database (start in production mode)
4. Set up security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Estimates collection
    match /estimates/{estimateId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4.2 Enable Authentication (Optional)

1. Go to Authentication
2. Enable Email/Password or Google Sign-In
3. Update security rules to require auth

---


## 💳 Step 5: Configure Stripe Webhooks

### 5.1 Create API Endpoint for Webhooks

Create `api/stripe-webhook.ts` (for Vercel serverless functions):

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const sig = req.headers['stripe-signature']!;
    
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      
      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          // Update database
          break;
        case 'checkout.session.completed':
          // Process order
          break;
      }
      
      res.json({ received: true });
    } catch (err) {
      console.error('Webhook error:', err);
      res.status(400).send(`Webhook Error: ${err}`);
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
```

### 5.2 Test Webhooks Locally

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe-webhook

# Trigger test events
stripe trigger payment_intent.succeeded
```

---

## ✅ Step 6: Production Checklist

### Before Going Live:

- [ ] All environment variables configured
- [ ] Gemini API key is valid and has quota
- [ ] Stripe is in LIVE mode (not test mode)
- [ ] Firebase Firestore security rules are set
- [ ] Vercel deployment successful
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Tested estimate generation end-to-end
- [ ] Tested payment flow with real card
- [ ] Error tracking configured (Sentry)
- [ ] Analytics configured (Google Analytics)
- [ ] Backup strategy for Firebase

### Security Checklist:

- [ ] API keys stored in environment variables (not in code)
- [ ] Firestore security rules prevent unauthorized access
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation on all forms
- [ ] XSS protection headers added (done in vercel.json)

---

## 📊 Step 7: Monitoring & Analytics

### 7.1 Set Up Sentry (Error Tracking)

```bash
npm install @sentry/react
```

Add to your `index.tsx`:

```typescript
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 1.0,
  });
}
```

### 7.2 Set Up Google Analytics

Add to `index.html`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🚀 Step 8: Test Production Build

```bash
# Build for production
npm run build

# Test production build locally
npm run preview
```

Visit `http://localhost:4173` and test all features.

---

## �� Step 9: Post-Deployment

### Monitor Your Application:

1. **Vercel Dashboard**: Check deployment status and logs
2. **Firebase Console**: Monitor database usage and errors
3. **Stripe Dashboard**: Track payments and webhooks
4. **Sentry**: Monitor error rates
5. **Google Analytics**: Track user behavior

### Performance Optimization:

- Enable Vercel Analytics
- Optimize images
- Enable caching
- Monitor Lighthouse scores

---

## 🎉 You're Live!

Your Myers Construct AI application is now production-ready and deployed!

### Next Steps:

1. Share your app URL
2. Gather user feedback
3. Iterate and improve
4. Scale as needed

### Support:

- Vercel Docs: https://vercel.com/docs
- Firebase Docs: https://firebase.google.com/docs
- Stripe Docs: https://stripe.com/docs

---

## 🐛 Troubleshooting

### Common Issues:

**Build fails on Vercel:**
- Check environment variables are set
- Verify all dependencies are in package.json
- Check build logs for errors

**Stripe payments not working:**
- Verify you're using LIVE keys (not test keys)
- Check webhook endpoint is accessible
- Verify webhook secret is correct

**Firebase connection issues:**
- Verify Firebase config in environment variables
- Check Firestore security rules
- Ensure Firebase project is active

**Gemini API errors:**
- Check API key is valid
- Verify you have API quota remaining
- Check API is enabled in Google Cloud Console

---

© 2026 Myers Construct AI - Built with ❤️ by MyersDigitalServicesAI
