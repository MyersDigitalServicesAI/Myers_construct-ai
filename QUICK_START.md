# 🚀 Quick Start - Deploy in 5 Minutes

## Fastest Way to Get Myers Construct AI Live

### 1. Clone & Install (1 min)
```bash
git clone your-repo
cd Myers_construct-ai
npm install
```

### 2. Environment Variables (2 min)
```bash
cp .env.example .env.local
```

Update `.env.local` with:
- Gemini API Key: `AIzaSyA-Rs6OcHNs44qppZVsDAUz9M5riWHddlo` (already set!)
- Get Stripe keys from: https://dashboard.stripe.com/apikeys
- Get Firebase config from: https://console.firebase.google.com/

### 3. Deploy to Vercel (2 min)
```bash
npm i -g vercel
vercel login
vercel --prod
```

Add environment variables in Vercel dashboard, then redeploy.

### Done! ✅

Your app is live at: `https://your-app.vercel.app`

---

## What's Already Configured:

✅ Gemini AI integration with error handling
✅ TypeScript setup
✅ Vite build configuration
✅ Security headers (vercel.json)
✅ Error handling utilities
✅ Firebase configuration template
✅ Comprehensive deployment guide

## What You Need to Configure:

⚠️ Firebase credentials (.env.local)
⚠️ Stripe live keys (.env.local)
⚠️ Database migration (dbService.ts)
⚠️ Firebase Firestore setup

---

For detailed instructions, see `DEPLOYMENT_GUIDE.md`
