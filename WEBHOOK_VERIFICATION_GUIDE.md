# Webhook Secret Configuration & Verification Guide

**Project:** Myers Construct AI  
**Date:** January 23, 2026  
**Status:** Environment Variable Update in Progress

---

## Environment Variables Required

The following environment variables must be set in Vercel for the webhook integration to work:

### Required Variables:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_live_... or sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Publishable Key (for frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... or pk_test_...

# Firebase Configuration
VITE_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## Step 1: Verify Environment Variables in Vercel

### Option A: Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project: **myers-construct-ai**
3. Navigate to **Settings** → **Environment Variables**
4. Verify these variables are set:
   - ✅ `STRIPE_SECRET_KEY`
   - ✅ `STRIPE_WEBHOOK_SECRET`
   - ✅ `VITE_STRIPE_PUBLISHABLE_KEY`
   - ✅ `FIREBASE_CLIENT_EMAIL`
   - ✅ `FIREBASE_PRIVATE_KEY`
   - ✅ `VITE_FIREBASE_PROJECT_ID`

### Option B: Using Vercel CLI

```bash
# Navigate to project directory
cd /home/ubuntu/Myers_construct-ai

# Link to Vercel project (if not already linked)
vercel link

# List all environment variables
vercel env ls

# Pull environment variables to local .env file
vercel env pull .env.production
```

---

## Step 2: Get Webhook Secret from Stripe

If you need to create or retrieve your webhook secret:

### Create Webhook Endpoint in Stripe:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter your webhook URL:
   ```
   https://your-domain.vercel.app/api/stripe-webhook
   ```
   Or for production:
   ```
   https://myers-construct-ai.vercel.app/api/stripe-webhook
   ```

4. Select events to listen to:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_...`)
7. Add this to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

---

## Step 3: Redeploy After Environment Variable Changes

**Important:** Environment variables are only applied to new deployments.

### Trigger a New Deployment:

#### Option A: Push to Git (Recommended)
```bash
cd /home/ubuntu/Myers_construct-ai
git add .
git commit -m "Update webhook configuration"
git push origin main
```

#### Option B: Manual Redeploy via Vercel CLI
```bash
cd /home/ubuntu/Myers_construct-ai
vercel --prod
```

#### Option C: Redeploy via Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select **myers-construct-ai** project
3. Go to **Deployments** tab
4. Click **"Redeploy"** on the latest deployment
5. Check **"Use existing Build Cache"** (optional)
6. Click **"Redeploy"**

---

## Step 4: Test Webhook Integration

### Test Using Stripe CLI (Local Testing)

```bash
# Install Stripe CLI (if not already installed)
brew install stripe/stripe-cli/stripe
# or
curl -s https://packages.stripe.com/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.com/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe

# Login to Stripe
stripe login

# Forward webhooks to your Vercel deployment
stripe listen --forward-to https://myers-construct-ai.vercel.app/api/stripe-webhook

# In another terminal, trigger a test event
stripe trigger checkout.session.completed
```

### Test Using Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click on your webhook endpoint
3. Click **"Send test webhook"**
4. Select event: `checkout.session.completed`
5. Click **"Send test webhook"**
6. Check the response:
   - ✅ **200 OK** = Webhook working correctly
   - ❌ **401/403** = Signature verification failed (check `STRIPE_WEBHOOK_SECRET`)
   - ❌ **500** = Server error (check logs)

---

## Step 5: Monitor Webhook Delivery

### View Webhook Logs in Stripe:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click on your webhook endpoint
3. View **"Recent deliveries"**
4. Check for:
   - ✅ Successful deliveries (200 status)
   - ⚠️ Failed deliveries (400/500 status)
   - 🔄 Retry attempts

### View Application Logs in Vercel:

```bash
# Using Vercel CLI
vercel logs myers-construct-ai --prod

# Or view in dashboard
# https://vercel.com/myersdigitalservicesais-projects/myers-construct-ai/logs
```

---

## Step 6: Test End-to-End Payment Flow

### Complete Test Checkout:

1. Visit your production site: `https://myers-construct-ai.vercel.app`
2. Navigate to pricing page
3. Click **"Subscribe"** on any plan
4. Use Stripe test card:
   ```
   Card Number: 4242 4242 4242 4242
   Expiry: Any future date (e.g., 12/34)
   CVC: Any 3 digits (e.g., 123)
   ZIP: Any 5 digits (e.g., 12345)
   ```
5. Complete checkout
6. Verify:
   - ✅ Redirected to success page
   - ✅ Webhook received in Stripe dashboard
   - ✅ Database updated in Firestore
   - ✅ User subscription activated

---

## Troubleshooting

### Issue: Webhook Returns 401 Unauthorized

**Cause:** Webhook signature verification failed

**Solution:**
1. Verify `STRIPE_WEBHOOK_SECRET` is correct in Vercel
2. Ensure the secret matches the one in Stripe Dashboard
3. Redeploy after updating environment variable
4. Check that webhook endpoint URL matches exactly

### Issue: Webhook Returns 500 Internal Server Error

**Cause:** Error in webhook handler code or database connection

**Solution:**
1. Check Vercel logs: `vercel logs --prod`
2. Verify Firebase credentials are correct
3. Check that `FIREBASE_PRIVATE_KEY` includes `\n` characters
4. Ensure all required environment variables are set

### Issue: Webhook Not Receiving Events

**Cause:** Webhook endpoint not configured in Stripe

**Solution:**
1. Verify webhook endpoint exists in Stripe Dashboard
2. Check that the URL is correct
3. Ensure the endpoint is not disabled
4. Verify events are selected

### Issue: Database Not Updating

**Cause:** Firebase credentials invalid or permissions issue

**Solution:**
1. Verify Firebase service account has Firestore write permissions
2. Check that `FIREBASE_PRIVATE_KEY` is properly formatted
3. Ensure `VITE_FIREBASE_PROJECT_ID` matches your Firebase project
4. Check Vercel logs for Firebase errors

---

## Verification Checklist

Use this checklist to ensure everything is configured correctly:

### Environment Variables:
- [ ] `STRIPE_SECRET_KEY` set in Vercel (Production)
- [ ] `STRIPE_WEBHOOK_SECRET` set in Vercel (Production)
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` set in Vercel (Production)
- [ ] `FIREBASE_CLIENT_EMAIL` set in Vercel
- [ ] `FIREBASE_PRIVATE_KEY` set in Vercel
- [ ] `VITE_FIREBASE_PROJECT_ID` set in Vercel

### Stripe Configuration:
- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] Webhook URL matches production URL
- [ ] Required events selected
- [ ] Webhook secret copied to Vercel

### Deployment:
- [ ] New deployment triggered after env var changes
- [ ] Deployment successful (check Vercel dashboard)
- [ ] No build errors

### Testing:
- [ ] Test webhook sent from Stripe Dashboard
- [ ] Webhook returns 200 OK
- [ ] Test checkout completed successfully
- [ ] Database updated in Firestore
- [ ] User subscription activated

---

## Quick Reference Commands

```bash
# Link Vercel project
vercel link

# List environment variables
vercel env ls

# Pull environment variables
vercel env pull .env.production

# View production logs
vercel logs --prod

# Deploy to production
vercel --prod

# Test webhook with Stripe CLI
stripe listen --forward-to https://myers-construct-ai.vercel.app/api/stripe-webhook
stripe trigger checkout.session.completed
```

---

## Environment Variable Format Reference

### STRIPE_WEBHOOK_SECRET Format:
```
whsec_1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdef
```

### FIREBASE_PRIVATE_KEY Format:
```
"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```
**Important:** Must include `\n` characters and be wrapped in quotes.

---

## Next Steps After Configuration

1. ✅ Verify webhook secret is set in Vercel
2. ✅ Trigger a new deployment
3. ✅ Test webhook from Stripe Dashboard
4. ✅ Complete test checkout flow
5. ✅ Monitor webhook delivery logs
6. ✅ Verify database updates in Firestore

---

## Support Resources

- **Stripe Webhooks Documentation:** https://stripe.com/docs/webhooks
- **Vercel Environment Variables:** https://vercel.com/docs/environment-variables
- **Stripe CLI Documentation:** https://stripe.com/docs/stripe-cli
- **Firebase Admin SDK:** https://firebase.google.com/docs/admin/setup

---

**Configuration Status:** ✅ Ready for verification  
**Last Updated:** January 23, 2026  
**Project:** Myers Construct AI (myers-construct-ai)  
**Team:** MyersDigitalServicesAI's projects
