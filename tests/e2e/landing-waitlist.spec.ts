import { test, expect } from '@playwright/test';

test('Landing Page and Waitlist Flow', async ({ page }) => {
    // 1. Visit Landing Page
    await page.goto('/');
    await expect(page).toHaveTitle(/Myers Construct AI/);

    // 2. Verify Key Messaging
    await expect(page.getByText('Your phone')).toBeVisible();
    await expect(page.getByText('prints money')).toBeVisible();
    await expect(page.getByText('while you work')).toBeVisible();
    await expect(page.getByText('Early Access')).toBeVisible();

    // 3. Fill Waitlist Form
    await page.getByPlaceholder('YOUR NAME').fill('E2E Test User');
    await page.getByPlaceholder('EMAIL ADDRESS').fill(`e2e-test-${Date.now()}@example.com`);
    await page.getByPlaceholder('MOBILE PHONE').fill('555-0199');
    await page.getByPlaceholder('TRADE (e.g. ROOFING)').fill('Electrician');

    // 4. Submit Form
    await page.getByRole('button', { name: /Claim Spot/ }).click();

    // 5. Verify Success Message
    await expect(page.getByText(/Spot Secured/i)).toBeVisible();
    await expect(page.getByText(/keep an eye on your texts/i)).toBeVisible();
});

test('Waitlist Admin View Access', async ({ page }) => {
    // 1. Go to Login
    await page.goto('/');

    // Use the Sign In button in the nav
    await page.getByRole('button', { name: /Sign In/ }).click();

    // Check if Login is visible
    await expect(page.getByText('Secure Access Node')).toBeVisible();

    // Use Bypass Identity for testing
    await page.getByText('[TEST MODE] Bypass Identity').click();

    // 2. Verify Dashboard is loaded
    await expect(page.getByText('Command Node')).toBeVisible();

    // 3. Go to Founders List (Waitlist Dashboard)
    await page.getByText('Founders List').click();

    // 4. Verify Waitlist Ledger
    await expect(page.getByText('Founders Ledger')).toBeVisible();
    await expect(page.getByText('Spots Left')).toBeVisible();
});
