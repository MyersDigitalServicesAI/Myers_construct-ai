#!/bin/bash

# Webhook Testing Script for Myers Construct AI
# Tests the Stripe webhook endpoint after configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Myers Construct AI - Webhook Testing Script              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get deployment URL
read -p "Enter your Vercel deployment URL (e.g., https://myers-construct-ai.vercel.app): " DEPLOYMENT_URL

# Remove trailing slash if present
DEPLOYMENT_URL=${DEPLOYMENT_URL%/}

WEBHOOK_URL="${DEPLOYMENT_URL}/api/stripe-webhook"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Test 1: Check Webhook Endpoint Accessibility${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Test if webhook endpoint is accessible
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}')

if [ "$HTTP_CODE" == "400" ] || [ "$HTTP_CODE" == "401" ]; then
    echo -e "${GREEN}✓${NC} Webhook endpoint is accessible (HTTP $HTTP_CODE)"
    echo -e "  ${YELLOW}Note:${NC} 400/401 is expected without valid Stripe signature"
else
    echo -e "${YELLOW}⚠${NC}  Webhook endpoint returned HTTP $HTTP_CODE"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Test 2: Check Checkout Session Endpoint${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

CHECKOUT_URL="${DEPLOYMENT_URL}/api/create-checkout-session"

# Test checkout endpoint with minimal data
CHECKOUT_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$CHECKOUT_URL" \
  -H "Content-Type: application/json" \
  -d '{"planName": "Pro", "userId": "test_user_123"}')

CHECKOUT_HTTP_CODE=$(echo "$CHECKOUT_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
CHECKOUT_BODY=$(echo "$CHECKOUT_RESPONSE" | sed '/HTTP_CODE:/d')

if [ "$CHECKOUT_HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓${NC} Checkout endpoint is working (HTTP $CHECKOUT_HTTP_CODE)"
    echo -e "  Response: $(echo $CHECKOUT_BODY | head -c 100)..."
elif [ "$CHECKOUT_HTTP_CODE" == "500" ]; then
    echo -e "${YELLOW}⚠${NC}  Checkout endpoint returned HTTP 500"
    echo -e "  ${YELLOW}Note:${NC} This may be expected if Stripe keys are not configured"
else
    echo -e "${YELLOW}⚠${NC}  Checkout endpoint returned HTTP $CHECKOUT_HTTP_CODE"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Test 3: Verify Stripe Webhook Configuration${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo "To complete webhook testing, you need to:"
echo ""
echo "1. ${GREEN}Configure webhook in Stripe Dashboard:${NC}"
echo "   URL: $WEBHOOK_URL"
echo "   Events: checkout.session.completed, customer.subscription.*"
echo ""
echo "2. ${GREEN}Copy webhook signing secret:${NC}"
echo "   - Go to https://dashboard.stripe.com/webhooks"
echo "   - Click on your webhook endpoint"
echo "   - Copy the 'Signing secret' (starts with whsec_)"
echo ""
echo "3. ${GREEN}Add to Vercel environment variables:${NC}"
echo "   - Go to https://vercel.com/dashboard"
echo "   - Select 'myers-construct-ai' project"
echo "   - Settings → Environment Variables"
echo "   - Add: STRIPE_WEBHOOK_SECRET = whsec_..."
echo ""
echo "4. ${GREEN}Redeploy the application:${NC}"
echo "   - Push to git, or"
echo "   - Run: vercel --prod"
echo ""
echo "5. ${GREEN}Test webhook from Stripe Dashboard:${NC}"
echo "   - Go to https://dashboard.stripe.com/webhooks"
echo "   - Click 'Send test webhook'"
echo "   - Select 'checkout.session.completed'"
echo "   - Verify response is 200 OK"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Test 4: Test with Stripe CLI (Optional)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

if command -v stripe &> /dev/null; then
    echo -e "${GREEN}✓${NC} Stripe CLI is installed"
    echo ""
    echo "To test webhooks locally with Stripe CLI:"
    echo ""
    echo "  ${YELLOW}# Forward webhooks to your deployment${NC}"
    echo "  stripe listen --forward-to $WEBHOOK_URL"
    echo ""
    echo "  ${YELLOW}# In another terminal, trigger test event${NC}"
    echo "  stripe trigger checkout.session.completed"
    echo ""
else
    echo -e "${YELLOW}⚠${NC}  Stripe CLI not installed"
    echo ""
    echo "To install Stripe CLI:"
    echo ""
    echo "  ${YELLOW}# macOS${NC}"
    echo "  brew install stripe/stripe-cli/stripe"
    echo ""
    echo "  ${YELLOW}# Linux${NC}"
    echo "  curl -s https://packages.stripe.com/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg"
    echo "  echo \"deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.com/stripe-cli-debian-local stable main\" | sudo tee -a /etc/apt/sources.list.d/stripe.list"
    echo "  sudo apt update && sudo apt install stripe"
    echo ""
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Webhook URL: $WEBHOOK_URL"
echo "Checkout URL: $CHECKOUT_URL"
echo ""
echo "Next Steps:"
echo "  1. Configure webhook in Stripe Dashboard"
echo "  2. Add STRIPE_WEBHOOK_SECRET to Vercel"
echo "  3. Redeploy application"
echo "  4. Test webhook from Stripe Dashboard"
echo "  5. Complete test checkout flow"
echo ""
echo -e "${GREEN}For detailed instructions, see: WEBHOOK_VERIFICATION_GUIDE.md${NC}"
echo ""
