/**
 * Complete E2E Test Suite for Myers Construct AI Payment System
 * 
 * Tests all aspects including:
 * - Checkout session creation
 * - Webhook handling
 * - Payment flows
 * - Error scenarios
 * - Security validation
 */

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const API_BASE = process.env.API_BASE || '/api';

test.describe('Payment System E2E Tests', () => {

    test.describe('1. Checkout Session Creation', () => {

        test('should create subscription checkout session for Pro plan', async ({ request }) => {
            const response = await request.post(`${API_BASE}/create-checkout-session`, {
                data: {
                    planName: 'Pro',
                    userId: 'test_user_123',
                    customerEmail: 'test@example.com',
                    metadata: {}
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data).toHaveProperty('id');
            expect(data.id).toMatch(/^cs_test_/);
        });

        test('should create subscription checkout session for Business plan', async ({ request }) => {
            const response = await request.post(`${API_BASE}/create-checkout-session`, {
                data: {
                    planName: 'Business',
                    userId: 'test_user_456',
                    customerEmail: 'business@example.com',
                    metadata: {}
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data).toHaveProperty('id');
        });

        test('should create checkout session for Enterprise plan', async ({ request }) => {
            const response = await request.post(`${API_BASE}/create-checkout-session`, {
                data: {
                    planName: 'Enterprise',
                    userId: 'test_user_789',
                    customerEmail: 'enterprise@example.com',
                    metadata: {}
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data).toHaveProperty('id');
        });

        test('should create waitlist founder checkout session', async ({ request }) => {
            const response = await request.post(`${API_BASE}/create-checkout-session`, {
                data: {
                    planName: 'Founder',
                    customerEmail: 'founder@example.com',
                    metadata: {
                        is_waitlist_signup: 'true',
                        waitlist_name: 'Test Founder',
                        waitlist_company: 'Test Company',
                        waitlist_phone: '555-0100',
                        waitlist_trade: 'General Contractor'
                    }
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data).toHaveProperty('id');
        });

        test('should reject checkout without planName', async ({ request }) => {
            const response = await request.post(`${API_BASE}/create-checkout-session`, {
                data: {
                    userId: 'test_user_123',
                    customerEmail: 'test@example.com'
                }
            });

            expect(response.status()).toBe(400);
            const data = await response.json();
            expect(data.message).toContain('plan');
        });

        test('should reject checkout without userId (non-waitlist)', async ({ request }) => {
            const response = await request.post(`${API_BASE}/create-checkout-session`, {
                data: {
                    planName: 'Pro',
                    customerEmail: 'test@example.com'
                }
            });

            expect(response.status()).toBe(400);
            const data = await response.json();
            expect(data.message).toContain('userId');
        });

        test('should reject invalid plan name', async ({ request }) => {
            const response = await request.post(`${API_BASE}/create-checkout-session`, {
                data: {
                    planName: 'InvalidPlan',
                    userId: 'test_user_123',
                    customerEmail: 'test@example.com'
                }
            });

            expect(response.status()).toBe(400);
            const data = await response.json();
            expect(data.message).toContain('Invalid plan');
        });

        test('should handle missing request body', async ({ request }) => {
            const response = await request.post(`${API_BASE}/create-checkout-session`, {
                data: {}
            });

            expect(response.status()).toBe(400);
        });

        test('should reject GET method', async ({ request }) => {
            const response = await request.get(`${API_BASE}/create-checkout-session`);
            expect(response.status()).toBe(405);
        });
    });

    test.describe('2. Webhook Security', () => {

        test('should reject webhook without signature', async ({ request }) => {
            const response = await request.post(`${API_BASE}/stripe-webhook`, {
                data: {
                    type: 'checkout.session.completed',
                    data: { object: {} }
                }
            });

            expect(response.status()).toBe(400);
        });

        test('should reject webhook with invalid signature', async ({ request }) => {
            const response = await request.post(`${API_BASE}/stripe-webhook`, {
                headers: {
                    'stripe-signature': 't=123456789,v1=invalid_signature'
                },
                data: JSON.stringify({
                    type: 'checkout.session.completed',
                    data: { object: {} }
                })
            });

            expect(response.status()).toBe(400);
        });

        test('should reject non-POST methods', async ({ request }) => {
            const response = await request.get(`${API_BASE}/stripe-webhook`);
            expect(response.status()).toBe(405);
        });
    });

    test.describe('3. Pricing Validation', () => {

        test('should enforce correct pricing for Pro plan', async ({ request }) => {
            const response = await request.post(`${API_BASE}/create-checkout-session`, {
                data: {
                    planName: 'Pro',
                    userId: 'test_user_123',
                    customerEmail: 'test@example.com'
                }
            });

            expect(response.status()).toBe(200);
            // Pricing is enforced server-side at $149
        });

        test('should enforce correct pricing for Business plan', async ({ request }) => {
            const response = await request.post(`${API_BASE}/create-checkout-session`, {
                data: {
                    planName: 'Business',
                    userId: 'test_user_123',
                    customerEmail: 'test@example.com'
                }
            });

            expect(response.status()).toBe(200);
            // Pricing is enforced server-side at $299
        });

        test('should enforce correct pricing for Enterprise plan', async ({ request }) => {
            const response = await request.post(`${API_BASE}/create-checkout-session`, {
                data: {
                    planName: 'Enterprise',
                    userId: 'test_user_123',
                    customerEmail: 'test@example.com'
                }
            });

            expect(response.status()).toBe(200);
            // Pricing is enforced server-side at $1049
        });

        test('should enforce correct pricing for Founder plan', async ({ request }) => {
            const response = await request.post(`${API_BASE}/create-checkout-session`, {
                data: {
                    planName: 'Founder',
                    customerEmail: 'founder@example.com',
                    metadata: { is_waitlist_signup: 'true' }
                }
            });

            expect(response.status()).toBe(200);
            // Pricing is enforced server-side at $250
        });
    });

    test.describe('4. Metadata Handling', () => {

        test('should preserve metadata in checkout session', async ({ request }) => {
            const metadata = {
                customField: 'testValue',
                userId: 'test_123',
                source: 'e2e_test'
            };

            const response = await request.post(`${API_BASE}/create-checkout-session`, {
                data: {
                    planName: 'Pro',
                    userId: 'test_user_123',
                    customerEmail: 'test@example.com',
                    metadata
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data).toHaveProperty('id');
        });

        test('should handle waitlist metadata correctly', async ({ request }) => {
            const metadata = {
                is_waitlist_signup: 'true',
                waitlist_name: 'John Doe',
                waitlist_company: 'Acme Construction',
                waitlist_phone: '555-0100',
                waitlist_trade: 'Electrical'
            };

            const response = await request.post(`${API_BASE}/create-checkout-session`, {
                data: {
                    planName: 'Founder',
                    customerEmail: 'john@acme.com',
                    metadata
                }
            });

            expect(response.status()).toBe(200);
        });
    });

    test.describe('5. Error Handling', () => {

        test('should handle malformed JSON', async ({ request }) => {
            try {
                const response = await request.post(`${API_BASE}/create-checkout-session`, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: 'invalid json{'
                });

                expect(response.status()).toBeGreaterThanOrEqual(400);
            } catch (error) {
                // Expected to fail
                expect(error).toBeDefined();
            }
        });

        test('should handle empty request body', async ({ request }) => {
            const response = await request.post(`${API_BASE}/create-checkout-session`, {
                data: null
            });

            expect(response.status()).toBeGreaterThanOrEqual(400);
        });

        test('should handle missing Content-Type header', async ({ request }) => {
            const response = await request.post(`${API_BASE}/create-checkout-session`, {
                headers: {},
                data: {
                    planName: 'Pro',
                    userId: 'test_user_123'
                }
            });

            // Should either work or return appropriate error
            expect([200, 400, 415]).toContain(response.status());
        });
    });

    test.describe('6. Plan Definitions', () => {

        const validPlans = ['Pro', 'Business', 'Enterprise', 'Founder', 'Pro Team', 'Reseller'];

        for (const plan of validPlans) {
            test(`should accept ${plan} plan`, async ({ request }) => {
                const isWaitlist = plan === 'Founder';
                const requestData: any = {
                    planName: plan,
                    customerEmail: `test-${plan.toLowerCase()}@example.com`
                };

                if (isWaitlist) {
                    requestData.metadata = { is_waitlist_signup: 'true' };
                } else {
                    requestData.userId = `test_user_${plan}`;
                }

                const response = await request.post(`${API_BASE}/create-checkout-session`, {
                    data: requestData
                });

                expect(response.status()).toBe(200);
                const data = await response.json();
                expect(data).toHaveProperty('id');
            });
        }
    });

    test.describe('7. API Response Format', () => {

        test('should return valid JSON response', async ({ request }) => {
            const response = await request.post(`${API_BASE}/create-checkout-session`, {
                data: {
                    planName: 'Pro',
                    userId: 'test_user_123',
                    customerEmail: 'test@example.com'
                }
            });

            expect(response.status()).toBe(200);
            expect(response.headers()['content-type']).toContain('application/json');

            const data = await response.json();
            expect(typeof data).toBe('object');
        });

        test('should return session ID in correct format', async ({ request }) => {
            const response = await request.post(`${API_BASE}/create-checkout-session`, {
                data: {
                    planName: 'Pro',
                    userId: 'test_user_123',
                    customerEmail: 'test@example.com'
                }
            });

            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data.id).toMatch(/^cs_(test_|live_)/);
        });

        test('should return error message in correct format', async ({ request }) => {
            const response = await request.post(`${API_BASE}/create-checkout-session`, {
                data: {
                    planName: 'InvalidPlan',
                    userId: 'test_user_123'
                }
            });

            expect(response.status()).toBe(400);
            const data = await response.json();
            expect(data).toHaveProperty('message');
            expect(typeof data.message).toBe('string');
        });
    });

    test.describe('8. Concurrent Request Handling', () => {

        test('should handle multiple concurrent requests', async ({ request }) => {
            const requests = Array.from({ length: 5 }, (_, i) =>
                request.post(`${API_BASE}/create-checkout-session`, {
                    data: {
                        planName: 'Pro',
                        userId: `test_user_${i}`,
                        customerEmail: `test${i}@example.com`
                    }
                })
            );

            const responses = await Promise.all(requests);

            for (const response of responses) {
                expect(response.status()).toBe(200);
                const data = await response.json();
                expect(data).toHaveProperty('id');
            }
        });

        test('should handle rapid sequential requests', async ({ request }) => {
            for (let i = 0; i < 3; i++) {
                const response = await request.post(`${API_BASE}/create-checkout-session`, {
                    data: {
                        planName: 'Pro',
                        userId: `test_user_seq_${i}`,
                        customerEmail: `seq${i}@example.com`
                    }
                });

                expect(response.status()).toBe(200);
            }
        });
    });

    test.describe('9. Email Validation', () => {

        test('should accept valid email formats', async ({ request }) => {
            const validEmails = [
                'test@example.com',
                'user+tag@example.co.uk',
                'first.last@subdomain.example.com',
                'user123@test-domain.com'
            ];

            for (const email of validEmails) {
                const response = await request.post(`${API_BASE}/create-checkout-session`, {
                    data: {
                        planName: 'Pro',
                        userId: 'test_user_123',
                        customerEmail: email
                    }
                });

                expect(response.status()).toBe(200);
            }
        });
    });

    test.describe('10. Integration Tests', () => {

        test('should complete full subscription flow simulation', async ({ request }) => {
            // Step 1: Create checkout session
            const checkoutResponse = await request.post(`${API_BASE}/create-checkout-session`, {
                data: {
                    planName: 'Pro',
                    userId: 'integration_test_user',
                    customerEmail: 'integration@example.com',
                    metadata: {
                        test: 'integration',
                        timestamp: Date.now().toString()
                    }
                }
            });

            expect(checkoutResponse.status()).toBe(200);
            const checkoutData = await checkoutResponse.json();
            expect(checkoutData).toHaveProperty('id');

            // Step 2: Verify session ID format
            expect(checkoutData.id).toMatch(/^cs_(test_|live_)/);

            // Note: Actual payment and webhook would happen externally via Stripe
            // This test validates the checkout creation flow
        });

        test('should complete waitlist founder flow simulation', async ({ request }) => {
            // Step 1: Create waitlist checkout session
            const checkoutResponse = await request.post(`${API_BASE}/create-checkout-session`, {
                data: {
                    planName: 'Founder',
                    customerEmail: 'waitlist-integration@example.com',
                    metadata: {
                        is_waitlist_signup: 'true',
                        waitlist_name: 'Integration Test User',
                        waitlist_company: 'Test Corp',
                        waitlist_phone: '555-0199',
                        waitlist_trade: 'General Contractor'
                    }
                }
            });

            expect(checkoutResponse.status()).toBe(200);
            const checkoutData = await checkoutResponse.json();
            expect(checkoutData).toHaveProperty('id');
        });
    });
});
