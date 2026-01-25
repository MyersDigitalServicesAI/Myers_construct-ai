# Webhook Setup Quick Reference

**Project:** Myers Construct AI  
**Last Updated:** January 23, 2026

---

## 🚀 Quick Setup (5 Minutes)

### 1. Get Webhook Secret from Stripe

```
1. Go to: https://dashboard.stripe.com/webhooks
2. Click: "Add endpoint"
3. URL: https://myers-construct-ai.vercel.app/api/stripe-webhook
4. Events: Select these ↓
   ✓ checkout.session.completed
   ✓ customer.subscription.created
   ✓ customer.subscription.updated
   ✓ customer.subscription.deleted
   ✓ invoice.payment_succeeded
   ✓ invoice.payment_failed
5. Click: "Add endpoint"
6. Copy: Signing secret (whsec_...)
```

### 2. Add to Vercel

```
1. Go to: https://vercel.com/dashboard
2. Select: myers-construct-ai
3. Go to: Settings → Environment Variables
4. Add variable:
   Name: STRIPE_WEBHOOK_SECRET
   Value: whsec_... (paste from Stripe)
   Environment: Production ✓
5. Click: "Save"
```

### 3. Redeploy

```bash
# Option A: Push to git (recommended)
git add .
git commit -m "Configure webhook"
git push origin main

# Option B: Manual redeploy
vercel --prod
```

### 4. Test

```
1. Go to: https://dashboard.stripe.com/webhooks
2. Click: Your webhook endpoint
3. Click: "Send test webhook"
4. Select: checkout.session.completed
5. Click: "Send test webhook"
6. Verify: Response is 200 OK ✓
```

---

## 🔑 Required Environment Variables

| Variable | Example | Where to Get |
|----------|---------|--------------|
| `STRIPE_SECRET_KEY` | `sk_live_...` | Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe Dashboard → Webhooks → Signing secret |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Stripe Dashboard → Developers → API Keys |

---

## 🧪 Test Commands

### Test Webhook Endpoint
```bash
curl -X POST https://myers-construct-ai.vercel.app/api/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
# Expected: 400 or 401 (signature required)
```

### Test Checkout Endpoint
```bash
curl -X POST https://myers-construct-ai.vercel.app/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"planName": "Pro", "userId": "test_123"}'
# Expected: 200 with session ID
```

### Run Test Script
```bash
./test-webhook.sh
```

---

## 📋 Verification Checklist

- [ ] Webhook endpoint created in Stripe
- [ ] `STRIPE_WEBHOOK_SECRET` added to Vercel
- [ ] Application redeployed
- [ ] Test webhook sent (200 OK response)
- [ ] Test checkout completed successfully

---

## ⚠️ Common Issues

### Issue: Webhook returns 401
**Fix:** Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard

### Issue: Webhook returns 500
**Fix:** Check Vercel logs: `vercel logs --prod`

### Issue: Database not updating
**Fix:** Verify Firebase credentials in Vercel environment variables

---

## 📚 Documentation

- **Full Guide:** `WEBHOOK_VERIFICATION_GUIDE.md`
- **Test Script:** `test-webhook.sh`
- **E2E Tests:** `E2E_TEST_REPORT.md`

---

## 🔗 Quick Links

- [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
- [Vercel Dashboard](https://vercel.com/myersdigitalservicesais-projects/myers-construct-ai)
- [Vercel Logs](https://vercel.com/myersdigitalservicesais-projects/myers-construct-ai/logs)
- [Stripe Documentation](https://stripe.com/docs/webhooks)

---

**Status:** Ready for testing ✅  
**Webhook URL:** `https://myers-construct-ai.vercel.app/api/stripe-webhook`
