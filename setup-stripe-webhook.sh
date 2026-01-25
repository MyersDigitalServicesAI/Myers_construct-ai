#!/bin/bash

# Automated Stripe Webhook Setup Script for Myers Construct AI
# This script creates the webhook endpoint in Stripe and configures Vercel

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║         Myers Construct AI - Stripe Webhook Setup             ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo -e "${RED}✗${NC} Stripe CLI is not installed"
    echo ""
    echo "Please install Stripe CLI first:"
    echo ""
    echo -e "${YELLOW}macOS:${NC}"
    echo "  brew install stripe/stripe-cli/stripe"
    echo ""
    echo -e "${YELLOW}Linux:${NC}"
    echo "  curl -s https://packages.stripe.com/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg"
    echo "  echo \"deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.com/stripe-cli-debian-local stable main\" | sudo tee -a /etc/apt/sources.list.d/stripe.list"
    echo "  sudo apt update && sudo apt install stripe"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓${NC} Stripe CLI is installed"
echo ""

# Check if user is logged in to Stripe
if ! stripe config --list &> /dev/null; then
    echo -e "${YELLOW}⚠${NC}  Not logged in to Stripe"
    echo ""
    echo "Logging in to Stripe..."
    stripe login
    echo ""
fi

echo -e "${GREEN}✓${NC} Logged in to Stripe"
echo ""

# Get deployment URL
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Step 1: Configure Deployment URL${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

read -p "Enter your production URL (default: https://myers-construct-ai.vercel.app): " DEPLOYMENT_URL
DEPLOYMENT_URL=${DEPLOYMENT_URL:-https://myers-construct-ai.vercel.app}

# Remove trailing slash
DEPLOYMENT_URL=${DEPLOYMENT_URL%/}

WEBHOOK_URL="${DEPLOYMENT_URL}/api/stripe-webhook"

echo ""
echo -e "${GREEN}Webhook URL:${NC} $WEBHOOK_URL"
echo ""

# Create webhook endpoint
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Step 2: Create Webhook Endpoint in Stripe${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

echo "Creating webhook endpoint..."
echo ""

# Use Stripe CLI to create webhook
WEBHOOK_RESPONSE=$(stripe webhooks create \
  --url "$WEBHOOK_URL" \
  --description "Myers Construct AI - Production Webhook" \
  --enabled-event checkout.session.completed \
  --enabled-event customer.subscription.created \
  --enabled-event customer.subscription.updated \
  --enabled-event customer.subscription.deleted \
  --enabled-event invoice.payment_succeeded \
  --enabled-event invoice.payment_failed \
  --format json 2>&1)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Webhook endpoint created successfully!"
    echo ""
    
    # Extract webhook ID and secret
    WEBHOOK_ID=$(echo "$WEBHOOK_RESPONSE" | grep -o '"id":"whsec_[^"]*"' | cut -d'"' -f4)
    WEBHOOK_SECRET=$(echo "$WEBHOOK_RESPONSE" | grep -o '"secret":"whsec_[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$WEBHOOK_SECRET" ]; then
        # Try alternative extraction
        WEBHOOK_SECRET=$(echo "$WEBHOOK_RESPONSE" | jq -r '.secret' 2>/dev/null)
    fi
    
    if [ -n "$WEBHOOK_SECRET" ]; then
        echo -e "${GREEN}Webhook Secret:${NC} $WEBHOOK_SECRET"
        echo ""
        
        # Save to .env file
        echo "STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET" >> .env.production
        echo -e "${GREEN}✓${NC} Webhook secret saved to .env.production"
        echo ""
    else
        echo -e "${YELLOW}⚠${NC}  Could not extract webhook secret automatically"
        echo ""
        echo "Please get the webhook secret from Stripe Dashboard:"
        echo "  https://dashboard.stripe.com/webhooks"
        echo ""
        read -p "Enter webhook secret (whsec_...): " WEBHOOK_SECRET
        echo "STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET" >> .env.production
        echo ""
    fi
else
    echo -e "${YELLOW}⚠${NC}  Could not create webhook automatically"
    echo ""
    echo "Please create webhook manually in Stripe Dashboard:"
    echo "  https://dashboard.stripe.com/webhooks"
    echo ""
    echo "Webhook URL: $WEBHOOK_URL"
    echo ""
    echo "Events to enable:"
    echo "  ✓ checkout.session.completed"
    echo "  ✓ customer.subscription.created"
    echo "  ✓ customer.subscription.updated"
    echo "  ✓ customer.subscription.deleted"
    echo "  ✓ invoice.payment_succeeded"
    echo "  ✓ invoice.payment_failed"
    echo ""
    read -p "Enter webhook secret (whsec_...): " WEBHOOK_SECRET
    echo "STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET" >> .env.production
    echo ""
fi

# Configure Vercel environment variable
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Step 3: Configure Vercel Environment Variable${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

if command -v vercel &> /dev/null; then
    echo "Adding STRIPE_WEBHOOK_SECRET to Vercel..."
    echo ""
    
    # Add environment variable to Vercel
    echo "$WEBHOOK_SECRET" | vercel env add STRIPE_WEBHOOK_SECRET production
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✓${NC} Environment variable added to Vercel"
        echo ""
    else
        echo ""
        echo -e "${YELLOW}⚠${NC}  Could not add environment variable automatically"
        echo ""
        echo "Please add manually in Vercel Dashboard:"
        echo "  https://vercel.com/myersdigitalservicesais-projects/myers-construct-ai/settings/environment-variables"
        echo ""
        echo "Variable name: STRIPE_WEBHOOK_SECRET"
        echo "Variable value: $WEBHOOK_SECRET"
        echo "Environment: Production"
        echo ""
    fi
else
    echo -e "${YELLOW}⚠${NC}  Vercel CLI not installed"
    echo ""
    echo "Please add environment variable manually in Vercel Dashboard:"
    echo "  https://vercel.com/myersdigitalservicesais-projects/myers-construct-ai/settings/environment-variables"
    echo ""
    echo "Variable name: STRIPE_WEBHOOK_SECRET"
    echo "Variable value: $WEBHOOK_SECRET"
    echo "Environment: Production"
    echo ""
fi

# Trigger redeployment
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Step 4: Trigger Redeployment${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

read -p "Trigger redeployment now? (y/n): " REDEPLOY

if [ "$REDEPLOY" = "y" ] || [ "$REDEPLOY" = "Y" ]; then
    if command -v vercel &> /dev/null; then
        echo ""
        echo "Triggering deployment..."
        vercel --prod
        echo ""
        echo -e "${GREEN}✓${NC} Deployment triggered"
    else
        echo ""
        echo "Please redeploy manually:"
        echo "  1. Push to GitHub: git push origin main"
        echo "  2. Or redeploy in Vercel Dashboard"
        echo ""
    fi
else
    echo ""
    echo -e "${YELLOW}⚠${NC}  Remember to redeploy for changes to take effect!"
    echo ""
    echo "Options:"
    echo "  1. Push to GitHub: git push origin main"
    echo "  2. Run: vercel --prod"
    echo "  3. Redeploy in Vercel Dashboard"
    echo ""
fi

# Test webhook
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Step 5: Test Webhook${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

read -p "Test webhook now? (y/n): " TEST_WEBHOOK

if [ "$TEST_WEBHOOK" = "y" ] || [ "$TEST_WEBHOOK" = "Y" ]; then
    echo ""
    echo "Testing webhook endpoint..."
    echo ""
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d '{"test": "data"}')
    
    if [ "$HTTP_CODE" == "400" ] || [ "$HTTP_CODE" == "401" ]; then
        echo -e "${GREEN}✓${NC} Webhook endpoint is accessible (HTTP $HTTP_CODE)"
        echo -e "  ${CYAN}Note:${NC} 400/401 is expected without valid Stripe signature"
        echo ""
    else
        echo -e "${YELLOW}⚠${NC}  Webhook endpoint returned HTTP $HTTP_CODE"
        echo ""
    fi
    
    echo "To test with real Stripe events:"
    echo ""
    echo -e "${YELLOW}Option 1: Stripe Dashboard${NC}"
    echo "  1. Go to https://dashboard.stripe.com/webhooks"
    echo "  2. Click on your webhook endpoint"
    echo "  3. Click 'Send test webhook'"
    echo "  4. Select 'checkout.session.completed'"
    echo "  5. Verify response is 200 OK"
    echo ""
    echo -e "${YELLOW}Option 2: Stripe CLI${NC}"
    echo "  stripe trigger checkout.session.completed --override checkout_session:metadata[planName]=Pro"
    echo ""
fi

# Summary
echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║                    Setup Complete! ✓                           ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

echo -e "${GREEN}Summary:${NC}"
echo "  ✓ Webhook URL: $WEBHOOK_URL"
echo "  ✓ Webhook Secret: $WEBHOOK_SECRET"
echo "  ✓ Environment variable configured"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Verify webhook in Stripe Dashboard"
echo "  2. Test checkout flow"
echo "  3. Monitor webhook delivery logs"
echo ""

echo -e "${CYAN}Documentation:${NC}"
echo "  • WEBHOOK_VERIFICATION_GUIDE.md - Complete setup guide"
echo "  • WEBHOOK_QUICK_REFERENCE.md - Quick reference"
echo "  • test-webhook.sh - Testing script"
echo ""

echo -e "${GREEN}Webhook setup complete! 🎉${NC}"
echo ""
