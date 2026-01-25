# Founders List - Quick Start

## ⚡ 3-Step Setup (5 Minutes)

### Step 1: Create Stripe Product (2 min)

1. Go to https://dashboard.stripe.com/products
2. Click **"+ Add product"**
3. Enter:
   - Name: `Myers Construct AI - Founder (Lifetime $250)`
   - Price: `$250.00 USD` monthly recurring
4. **Copy the Price ID** (starts with `price_...`)

### Step 2: Add to Vercel (2 min)

1. Go to https://vercel.com/myersdigitalservicesais-projects/myers-construct-ai/settings/environment-variables
2. Add new variable:
   - Key: `VITE_STRIPE_PRICE_FOUNDER`
   - Value: `price_xxxxxxxxxxxxx` (your Price ID)
   - Environments: All (Production, Preview, Development)
3. Save

### Step 3: Redeploy (1 min)

Changes are already pushed to GitHub. Vercel will auto-deploy.

Monitor: https://vercel.com/myersdigitalservicesais-projects/myers-construct-ai/deployments

---

## ✅ Test Checklist

After deployment completes:

1. Visit https://myers-construct-ai.vercel.app
2. Hero should show "Founders List: 30 Left"
3. Scroll to "Founders Access" section
4. Should see "30 of 30 Spots Remaining" badge
5. Click "CLAIM ONE OF 30 SPOTS" → should scroll to form
6. Fill form and submit → should redirect to Stripe
7. Stripe should show $250/month
8. Use test card: `4242 4242 4242 4242`
9. Complete payment
10. Refresh page → should show "29 of 30 Spots Remaining"

---

## 🎯 What Was Fixed

| Issue | Fix |
|-------|-----|
| ❌ Charging $299 instead of $250 | ✅ Now uses FOUNDER plan ($250) |
| ❌ No slot limit | ✅ Tracks via Firestore, max 30 |
| ❌ No slot display | ✅ Shows "X of 30 Remaining" |
| ❌ Can oversell | ✅ Validates before checkout |

---

## 📋 Environment Variables Needed

| Variable | Status | Value |
|----------|--------|-------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | ✅ Exists | `pk_...` |
| `VITE_STRIPE_PRICE_FOUNDER` | ⚠️ **ADD THIS** | `price_...` |
| `STRIPE_SECRET_KEY` | ✅ Exists | `sk_...` |
| `STRIPE_WEBHOOK_SECRET` | ✅ Exists | `whsec_...` |

---

## 🚨 Troubleshooting

**"All 30 Founder slots have been claimed" (but slots available)**
→ Check Firestore console for `waitlist` collection, verify `status` field

**Stripe checkout shows wrong price**
→ Verify `VITE_STRIPE_PRICE_FOUNDER` env var is set and redeploy

**Slots not updating after payment**
→ Check Stripe webhook logs, verify webhook is firing

---

## 📚 Full Documentation

See `FOUNDERS_LIST_SETUP.md` for complete details.

---

**Commit:** `7f46ddc`  
**Status:** ✅ Code deployed, awaiting Stripe Price ID  
**ETA:** 5 minutes to complete setup
