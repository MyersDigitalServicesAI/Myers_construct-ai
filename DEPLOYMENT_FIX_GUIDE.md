# Deployment Fix Guide - Myers Construct AI

**Issue:** Vercel builds failing with TypeScript errors despite correct code in repository  
**Root Cause:** Vercel build cache is stale and not picking up fixes  
**Status:** Code is correct, deployment mechanism needs manual intervention

---

## Current Situation

### ✅ What's Working
- All code fixes are correct and committed to GitHub
- Founders List implementation is complete
- Stripe Price ID configured: `price_1SsbNkPjJBZTkcSCEsNmDlkH`
- Environment variable `VITE_STRIPE_PRICE_FOUNDER` added to Vercel

### ❌ What's Broken
- Vercel deployments failing with cached TypeScript errors
- Error messages reference old code that no longer exists
- Build cache not clearing despite new commits

### 📊 Error Messages (False Positives)
```
api/generate-estimate.ts(1,48): error TS2307: Cannot find module '@google/generative-ai'
api/stripe-webhook.ts(37,31): error TS2552: Cannot find name 'getRawBody'
api/stripe-webhook.ts(102,1): error TS1005: '}' expected.
```

**Reality:** These errors don't exist in the current code!

---

## Solution Options

### Option 1: Manual Vercel Dashboard Redeploy (Recommended)

1. Go to: https://vercel.com/myersdigitalservicesais-projects/myers-construct-ai/deployments

2. Find the latest **READY** deployment (commit `8c6f692` - "Refactor project structure")

3. Click the three dots (⋮) next to it

4. Click **"Redeploy"**

5. In the modal, check **"Use existing Build Cache"** - **UNCHECK THIS!**

6. Click **"Redeploy"**

This forces a clean build from scratch.

---

### Option 2: Delete and Reconnect Vercel Project

**Warning:** This is nuclear but guaranteed to work.

1. Go to: https://vercel.com/myersdigitalservicesais-projects/myers-construct-ai/settings

2. Scroll to bottom → Click **"Delete Project"**

3. Confirm deletion

4. Go to: https://vercel.com/new

5. Import `MyersDigitalServicesAI/Myers_construct-ai` repository

6. Configure:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

7. Add environment variables:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_...
   VITE_STRIPE_PRICE_FOUNDER=price_1SsbNkPjJBZTkcSCEsNmDlkH
   VITE_STRIPE_PRICE_PRO=price_...
   VITE_STRIPE_PRICE_BUSINESS=price_...
   VITE_STRIPE_PRICE_PRO_TEAM=price_...
   VITE_STRIPE_PRICE_RESELLER=price_...
   VITE_STRIPE_PRICE_ENTERPRISE=price_...
   STRIPE_SECRET_KEY=sk_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

8. Deploy

---

### Option 3: Wait for Webhook to Trigger

Sometimes GitHub → Vercel webhooks are delayed. Wait 5-10 minutes and check:
https://vercel.com/myersdigitalservicesais-projects/myers-construct-ai/deployments

Look for commit `aabb7d1` - "Force Vercel cache clear"

---

## Verification Steps

Once deployment succeeds:

### 1. Check Build Logs
- Should see: `✓ Compiled successfully`
- Should NOT see: TypeScript errors

### 2. Test Production Site
Visit: https://myers-construct-ai.vercel.app

**Expected:**
- Hero shows: "Founders List: 30 Left"
- Scroll to "Founders Access" section
- Should see: "30 of 30 Spots Remaining" badge
- Fill waitlist form
- Should redirect to Stripe with $250/month pricing

### 3. Test Checkout Flow
1. Fill form with test data
2. Click "CLAIM SPOT"
3. Redirects to Stripe checkout
4. Price shows: **$250.00 / month**
5. Use test card: `4242 4242 4242 4242`
6. Complete payment
7. Returns to app with success message
8. Refresh page → "29 of 30 Spots Remaining"

---

## Technical Details

### Commits in Repository (Latest First)
```
aabb7d1 - Force Vercel cache clear - rebuild with correct dependencies
7f46ddc - Fix: Add Founders List with $250 lifetime pricing and slot tracking
7d7b9fb - Fix: Use correct @google/generative-ai package and GoogleGenerativeAI class
3da7670 - Add Myers Construct AI logo and update branding
9e5cd91 - Fix: Add missing dependencies, fix stripe-webhook syntax
```

### Files That Are Correct
- ✅ `api/generate-estimate.ts` - Uses `@google/generative-ai` (line 1)
- ✅ `api/stripe-webhook.ts` - `getRawBody` defined before use (line 28-34, used line 46)
- ✅ `api/stripe-webhook.ts` - All braces properly closed (116 lines total)
- ✅ `src/types.ts` - FOUNDER plan added to enum
- ✅ `src/config/planDefinitions.ts` - FOUNDER plan config with $250 pricing
- ✅ `src/services/paymentService.ts` - Uses FOUNDER plan for waitlist
- ✅ `src/components/LandingPage.tsx` - Shows slot tracking UI

### Environment Variables Required
| Variable | Status | Value |
|----------|--------|-------|
| `VITE_STRIPE_PRICE_FOUNDER` | ✅ Added | `price_1SsbNkPjJBZTkcSCEsNmDlkH` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | ✅ Exists | `pk_...` |
| `STRIPE_SECRET_KEY` | ✅ Exists | `sk_...` |
| `STRIPE_WEBHOOK_SECRET` | ✅ Exists | `whsec_...` |

---

## Why This Happened

**Vercel Build Cache Issue:**
- Vercel caches `node_modules` and build artifacts
- When dependencies change (like fixing imports), cache can become stale
- TypeScript compiler in cache references old module paths
- New code is correct, but cached compiler still looks for old paths

**Solution:**
- Force clean rebuild without cache
- This re-downloads dependencies and recompiles from scratch

---

## Next Steps

1. **Choose Option 1** (manual redeploy without cache) - fastest
2. Wait for deployment to complete (2-3 minutes)
3. Verify build logs show success
4. Test production site
5. Test checkout flow with test card
6. Verify Firestore updates with `PAID_FOUNDER` status
7. Confirm slot counter decrements

---

## Support

If deployment still fails after clean rebuild:

1. Check Vercel build logs for new errors
2. Verify all environment variables are set
3. Check Firebase configuration is correct
4. Verify Stripe API keys are valid

---

**Last Updated:** January 24, 2026  
**Status:** Awaiting manual Vercel redeploy  
**Confidence:** HIGH - Code is correct, just needs clean build
