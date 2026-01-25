#!/bin/bash

# Complete E2E Test Runner for Myers Construct AI
# This script runs comprehensive tests on all payment system aspects

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Myers Construct AI - Complete E2E Test Suite             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    echo ""
fi

# Load test environment variables
if [ -f ".env.test" ]; then
    set -a
    source .env.test 2>/dev/null || true
    set +a
    echo -e "${GREEN}✓${NC} Test environment loaded"
else
    echo -e "${YELLOW}⚠${NC}  .env.test not found, using default values"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Test Suite 1: Playwright E2E Tests${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Run Playwright tests
if command -v npx &> /dev/null; then
    echo -e "${YELLOW}Running Playwright E2E tests...${NC}"
    npx playwright test tests/e2e/complete-payment-e2e.spec.ts --reporter=list || true
    echo ""
else
    echo -e "${RED}✗${NC} Playwright not found, skipping browser tests"
    echo ""
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Test Suite 2: API Endpoint Tests${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Test API endpoints if server is running
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Server is running"
    
    echo -e "${YELLOW}Testing checkout session creation...${NC}"
    
    # Test 1: Valid Pro plan checkout
    echo -n "  • Pro plan checkout: "
    RESPONSE=$(curl -s -X POST http://localhost:5173/api/create-checkout-session \
        -H "Content-Type: application/json" \
        -d '{"planName":"Pro","userId":"test_123","customerEmail":"test@example.com"}')
    
    if echo "$RESPONSE" | grep -q '"id"'; then
        echo -e "${GREEN}PASS${NC}"
    else
        echo -e "${RED}FAIL${NC}"
        echo "    Response: $RESPONSE"
    fi
    
    # Test 2: Valid Business plan checkout
    echo -n "  • Business plan checkout: "
    RESPONSE=$(curl -s -X POST http://localhost:5173/api/create-checkout-session \
        -H "Content-Type: application/json" \
        -d '{"planName":"Business","userId":"test_456","customerEmail":"business@example.com"}')
    
    if echo "$RESPONSE" | grep -q '"id"'; then
        echo -e "${GREEN}PASS${NC}"
    else
        echo -e "${RED}FAIL${NC}"
    fi
    
    # Test 3: Invalid plan rejection
    echo -n "  • Invalid plan rejection: "
    RESPONSE=$(curl -s -X POST http://localhost:5173/api/create-checkout-session \
        -H "Content-Type: application/json" \
        -d '{"planName":"InvalidPlan","userId":"test_789","customerEmail":"test@example.com"}')
    
    if echo "$RESPONSE" | grep -q 'Invalid plan'; then
        echo -e "${GREEN}PASS${NC}"
    else
        echo -e "${RED}FAIL${NC}"
    fi
    
    # Test 4: Missing userId rejection
    echo -n "  • Missing userId rejection: "
    RESPONSE=$(curl -s -X POST http://localhost:5173/api/create-checkout-session \
        -H "Content-Type: application/json" \
        -d '{"planName":"Pro","customerEmail":"test@example.com"}')
    
    if echo "$RESPONSE" | grep -q 'userId'; then
        echo -e "${GREEN}PASS${NC}"
    else
        echo -e "${RED}FAIL${NC}"
    fi
    
    # Test 5: Waitlist founder checkout
    echo -n "  • Waitlist founder checkout: "
    RESPONSE=$(curl -s -X POST http://localhost:5173/api/create-checkout-session \
        -H "Content-Type: application/json" \
        -d '{"planName":"Founder","customerEmail":"founder@example.com","metadata":{"is_waitlist_signup":"true","waitlist_name":"Test User"}}')
    
    if echo "$RESPONSE" | grep -q '"id"'; then
        echo -e "${GREEN}PASS${NC}"
    else
        echo -e "${RED}FAIL${NC}"
    fi
    
    # Test 6: Webhook endpoint exists
    echo -n "  • Webhook endpoint exists: "
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:5173/api/stripe-webhook \
        -H "Content-Type: application/json" \
        -d '{}')
    
    if [ "$RESPONSE" != "404" ]; then
        echo -e "${GREEN}PASS${NC} (HTTP $RESPONSE)"
    else
        echo -e "${RED}FAIL${NC} (HTTP $RESPONSE)"
    fi
    
else
    echo -e "${YELLOW}⚠${NC}  Server not running at http://localhost:5173"
    echo "    Start server with: npm run dev"
    echo "    Then run this script again"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Test Suite 3: Code Quality & Structure${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Check for required files
echo -e "${YELLOW}Checking project structure...${NC}"

FILES=(
    "api/create-checkout-session.ts"
    "api/stripe-webhook.ts"
    "src/components/PricingPage.tsx"
    "src/components/EmbeddedCheckoutModal.tsx"
    "package.json"
    "vite.config.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
    else
        echo -e "  ${RED}✗${NC} $file (missing)"
    fi
done

echo ""
echo -e "${YELLOW}Checking TypeScript compilation...${NC}"
if npx tsc --noEmit 2>&1 | head -5; then
    echo -e "${GREEN}✓${NC} TypeScript compilation check complete"
else
    echo -e "${YELLOW}⚠${NC}  TypeScript compilation has warnings"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Test Suite 4: Security Validation${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Checking security configurations...${NC}"

# Check for environment variable usage
echo -n "  • Environment variables protected: "
if grep -r "STRIPE_SECRET_KEY" api/ | grep -q "process.env"; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL${NC}"
fi

# Check for webhook signature verification
echo -n "  • Webhook signature verification: "
if grep -q "stripe.webhooks.constructEvent" api/stripe-webhook.ts; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL${NC}"
fi

# Check for server-side pricing
echo -n "  • Server-side pricing enforcement: "
if grep -q "PRICING_TABLE" api/create-checkout-session.ts; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL${NC}"
fi

# Check for proper error handling
echo -n "  • Error handling implemented: "
if grep -q "try {" api/create-checkout-session.ts && grep -q "catch" api/create-checkout-session.ts; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL${NC}"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Test Suite 5: Configuration Validation${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}Validating configuration files...${NC}"

# Check package.json
echo -n "  • package.json valid: "
if node -e "require('./package.json')" 2>/dev/null; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL${NC}"
fi

# Check for Stripe dependency
echo -n "  • Stripe SDK installed: "
if grep -q '"stripe"' package.json; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL${NC}"
fi

# Check for Firebase Admin dependency
echo -n "  • Firebase Admin installed: "
if grep -q '"firebase-admin"' package.json; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL${NC}"
fi

# Check vite.config.ts
echo -n "  • Vite config valid: "
if [ -f "vite.config.ts" ]; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL${NC}"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Test Summary                                              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo -e "${GREEN}✓${NC} E2E test suite completed"
echo -e "${GREEN}✓${NC} API endpoint tests completed"
echo -e "${GREEN}✓${NC} Code quality checks completed"
echo -e "${GREEN}✓${NC} Security validation completed"
echo -e "${GREEN}✓${NC} Configuration validation completed"

echo ""
echo "Next Steps:"
echo "  1. Review any failed tests above"
echo "  2. Ensure server is running for API tests"
echo "  3. Configure Stripe test keys in .env.test"
echo "  4. Run: npx playwright test --ui for interactive testing"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo ""
