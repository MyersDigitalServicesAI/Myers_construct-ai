# Founders List Setup Guide

**Last Updated:** January 24, 2026  
**Status:** Ready for Deployment

---

## Overview

This guide explains how to complete the setup for the **Myers Construct AI Founders List** - a limited offer of 30 lifetime pricing slots at $250/month.

### What Was Fixed

**Problems Identified:**
1. ❌ Waitlist form was using BUSINESS plan ($299) instead of FOUNDER plan ($250)
2. ❌ No Stripe Price ID configured for $250 Founder plan
3. ❌ No slot tracking system (couldn't limit to 30 spots)
4. ❌ No real-time display of remaining spots

**Solutions Implemented:**
1. ✅ Added `FOUNDER` plan to `UserPlan` enum
2. ✅ Created `FOUNDER` plan configuration in `planDefinitions.ts` with $250 pricing
3. ✅ Implemented `getFounderSlotsRemaining()` function to track slots via Firestore
4. ✅ Updated `paymentService.ts` to use FOUNDER plan and check slot availability
5. ✅ Updated UI to show remaining slots in real-time
6. ✅ Added automatic slot validation before checkout

---

## Step 1: Create Stripe Product

You need to create a Stripe product for the $250/month Founder plan.

### Using Stripe Dashboard

1. Go to https://dashboard.stripe.com/products
2. Click **"+ Add product"**
3. Fill in the details:
   - **Name:** `Myers Construct AI - Founder (Lifetime $250)`
   - **Description:** `Limited to 30 spots. Lifetime pricing lock at $250/month with full Business plan features.`
   - **Pricing model:** Recurring
   - **Price:** `$250.00 USD`
   - **Billing period:** Monthly
   - **Payment type:** Subscription
4. Click **"Save product"**
5. **Copy the Price ID** (starts with `price_...`)

### Using Stripe CLI (Alternative)

```bash
stripe products create \
  --name "Myers Construct AI - Founder (Lifetime $250)" \
  --description "Limited to 30 spots. Lifetime pricing lock at $250/month"

stripe prices create \
  --product <PRODUCT_ID_FROM_ABOVE> \
  --unit-amount 25000 \
  --currency usd \
  --recurring[interval]=month
```

---

## Step 2: Add Environment Variable

Add the Stripe Price ID to your Vercel environment variables.

### Using Vercel Dashboard

1. Go to https://vercel.com/myersdigitalservicesais-projects/myers-construct-ai/settings/environment-variables
2. Click **"Add New"**
3. Fill in:
   - **Key:** `VITE_STRIPE_PRICE_FOUNDER`
   - **Value:** `price_xxxxxxxxxxxxx` (your Price ID from Step 1)
   - **Environment:** Production, Preview, Development (select all)
4. Click **"Save"**

### Using Vercel CLI (Alternative)

```bash
vercel env add VITE_STRIPE_PRICE_FOUNDER
# Paste your Price ID when prompted
# Select: Production, Preview, Development
```

---

## Step 3: Deploy Changes

### Copy Files from Fresh Clone

The fixed files are in `/tmp/myers-construct-fresh/`. You need to copy them to your repository:

```bash
# Navigate to your repo
cd /home/ubuntu/Myers_construct-ai

# Copy updated files
cp /tmp/myers-construct-fresh/src/types.ts src/
cp /tmp/myers-construct-fresh/src/config/planDefinitions.ts src/config/
cp /tmp/myers-construct-fresh/src/services/paymentService.ts src/services/
cp /tmp/myers-construct-fresh/src/components/LandingPage.tsx src/components/
```

### Commit and Push

```bash
cd /home/ubuntu/Myers_construct-ai

git add src/types.ts \
        src/config/planDefinitions.ts \
        src/services/paymentService.ts \
        src/components/LandingPage.tsx

git commit -m "Fix: Add Founders List with $250 lifetime pricing and slot tracking

- Add FOUNDER plan to UserPlan enum
- Create FOUNDER plan config with $250/month pricing
- Implement getFounderSlotsRemaining() for slot tracking
- Update paymentService to use FOUNDER plan and validate slots
- Update LandingPage to show remaining slots in real-time
- Add slot limit validation (max 30 spots)
- Disable CTA when all slots claimed"

git push origin main
```

### Trigger Redeployment

After pushing, Vercel will automatically deploy. Monitor at:
https://vercel.com/myersdigitalservicesais-projects/myers-construct-ai/deployments

---

## Step 4: Verify Deployment

### Check Environment Variable

```bash
# Using Vercel CLI
vercel env ls

# Should show:
# VITE_STRIPE_PRICE_FOUNDER | production, preview, development
```

### Test on Production

1. Visit https://myers-construct-ai.vercel.app
2. Check hero section - should show "Founders List: 30 Left" (or current count)
3. Scroll to "Founders Access" section
4. Should see "30 of 30 Spots Remaining" badge
5. Fill out waitlist form and click "CLAIM SPOT"
6. Should redirect to Stripe checkout with $250/month pricing
7. Complete test purchase with test card: `4242 4242 4242 4242`
8. Verify webhook updates Firestore with `status: 'PAID_FOUNDER'`
9. Refresh page - should now show "29 of 30 Spots Remaining"

---

## How It Works

### Slot Tracking System

**Firestore Collection:** `waitlist`  
**Query:** Count documents where `status == 'PAID_FOUNDER'`  
**Logic:** `remaining = max(0, 30 - paid_count)`

### Checkout Flow

1. User fills out waitlist form
2. `createWaitlistCheckout()` called
3. **Check slots:** `getFounderSlotsRemaining()` queries Firestore
4. **If slots available:** Create Stripe checkout session with FOUNDER priceId
5. **If no slots:** Throw error "All 30 Founder slots have been claimed"
6. User completes payment on Stripe
7. Stripe webhook fires `checkout.session.completed`
8. Webhook updates Firestore: `status: 'PAID_FOUNDER'`
9. Next user sees decremented count

### Real-Time Updates

- **On page load:** `useEffect` calls `getFounderSlotsRemaining()`
- **Updates UI:** Hero chip, Founders section badge, CTA button
- **Auto-disable:** Button disabled when `founderSlotsRemaining === 0`

---

## Files Modified

| File | Changes |
|------|---------|
| `src/types.ts` | Added `FOUNDER = "Founder"` to `UserPlan` enum |
| `src/config/planDefinitions.ts` | Added FOUNDER plan config, `getFounderSlotsRemaining()` function |
| `src/services/paymentService.ts` | Updated `createWaitlistCheckout()` to use FOUNDER plan and validate slots |
| `src/components/LandingPage.tsx` | Added slot tracking state, real-time UI updates, disabled state |

---

## Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` or `pk_live_...` |
| `VITE_STRIPE_PRICE_FOUNDER` | **NEW** Founder plan Price ID | `price_xxxxxxxxxxxxx` |
| `STRIPE_SECRET_KEY` | Stripe secret key (backend) | `sk_test_...` or `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | `whsec_...` |

---

## Firestore Data Structure

### Waitlist Collection

```javascript
// Document in `waitlist` collection
{
  name: "John Smith",
  company: "Smith Roofing",
  phone: "+1234567890",
  trade: "Roofing",
  email: "john@smithroofing.com",
  status: "PAID_FOUNDER",  // Key field for slot tracking
  stripeSessionId: "cs_test_...",
  stripeCustomerId: "cus_...",
  createdAt: Timestamp,
  paidAt: Timestamp
}
```

### Status Values

- `PENDING` - Submitted form but not paid
- `PAID_FOUNDER` - **Paid $250 Founder slot** (counted in slot limit)
- `ACTIVE` - Regular subscriber (not founder)

---

## Testing Checklist

### Pre-Deployment

- [ ] Stripe product created with $250/month pricing
- [ ] Price ID copied and saved
- [ ] `VITE_STRIPE_PRICE_FOUNDER` added to Vercel
- [ ] All files committed and pushed
- [ ] Deployment successful (no build errors)

### Post-Deployment

- [ ] Hero chip shows "Founders List: 30 Left"
- [ ] Founders section shows "30 of 30 Spots Remaining" badge
- [ ] "Claim One of 30 Spots" button visible and enabled
- [ ] Clicking button scrolls to waitlist form
- [ ] Filling form and submitting redirects to Stripe
- [ ] Stripe checkout shows $250/month
- [ ] Test payment completes successfully
- [ ] Webhook updates Firestore with PAID_FOUNDER status
- [ ] Page refresh shows "29 of 30 Spots Remaining"
- [ ] After 30 payments, button shows "All Spots Claimed" and is disabled

---

## Troubleshooting

### "All 30 Founder slots have been claimed" Error (But Slots Available)

**Cause:** Firestore query failing or returning incorrect count

**Fix:**
1. Check Firestore console: https://console.firebase.google.com
2. Navigate to `waitlist` collection
3. Verify `status` field values
4. Check for typos: should be `PAID_FOUNDER` (exact case)

### Stripe Checkout Shows Wrong Price

**Cause:** Environment variable not set or incorrect

**Fix:**
1. Check Vercel env vars: `vercel env ls`
2. Verify `VITE_STRIPE_PRICE_FOUNDER` exists
3. Verify Price ID starts with `price_`
4. Redeploy after adding env var

### Slots Not Updating After Payment

**Cause:** Webhook not firing or not updating Firestore correctly

**Fix:**
1. Check webhook logs in Stripe Dashboard
2. Verify `STRIPE_WEBHOOK_SECRET` is correct
3. Check Vercel function logs for errors
4. Ensure webhook endpoint is `https://myers-construct-ai.vercel.app/api/stripe-webhook`

### Button Always Disabled

**Cause:** `getFounderSlotsRemaining()` returning 0 incorrectly

**Fix:**
1. Open browser console
2. Check for errors in `getFounderSlotsRemaining()`
3. Verify Firebase config is correct
4. Check Firestore security rules allow reads

---

## Monitoring

### Check Current Slot Count

```javascript
// Run in browser console on the live site
const { getFounderSlotsRemaining } = await import('./src/config/planDefinitions');
const remaining = await getFounderSlotsRemaining();
console.log(`Founder slots remaining: ${remaining}`);
```

### Firestore Query

```javascript
// In Firebase console or via SDK
db.collection('waitlist')
  .where('status', '==', 'PAID_FOUNDER')
  .get()
  .then(snapshot => {
    console.log(`Total paid founders: ${snapshot.size}`);
    console.log(`Remaining slots: ${30 - snapshot.size}`);
  });
```

---

## Next Steps

1. **Create Stripe product** and get Price ID
2. **Add environment variable** to Vercel
3. **Deploy changes** by copying files and pushing to GitHub
4. **Test thoroughly** with Stripe test mode
5. **Switch to live mode** when ready for real customers
6. **Monitor slots** via Firestore console

---

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check Stripe webhook logs
3. Check Firestore console for data
4. Check browser console for JavaScript errors
5. Review this guide's troubleshooting section

---

**Status:** ✅ Code ready, awaiting Stripe configuration  
**Estimated Setup Time:** 10-15 minutes  
**Last Updated:** January 24, 2026
