import { test, expect } from '@playwright/test';

test('Estimate Generation Flow', async ({ page }) => {
    // 1. Go to Home
    await page.goto('/');
    await expect(page).toHaveTitle(/Myers Construct AI/);

    // 1b. Bypass Auth
    if (await page.getByText('[TEST MODE] Bypass Identity').isVisible()) {
        await page.getByText('[TEST MODE] Bypass Identity').click();
    }

    // 2. Start Intake
    // The dashboard button text is "New AI Takeoff"
    await page.getByText('New AI Takeoff').click();

    // 3. Intake Form
    await expect(page.locator('h2')).toContainText('Intake Node');

    await page.getByPlaceholder('e.g. Austin, TX (78701)').fill('E2E TEST: DETROIT, MI');
    await page.getByPlaceholder('e.g. Harbor Office Reno v2').fill('E2E TEST PROJECT');
    await page.getByPlaceholder(/Specify materials/).fill('Build a 2000sqft warehouse with steel siding.');

    // 4. Submit
    await page.click('button:has-text("Deploy Reasoning Core")');

    // 5. Processing (Wait for AI)
    await expect(page.getByText('Synthesizing Proposal')).toBeVisible();

    // 6. Results
    // API might take 5-10s
    await expect(page.locator('h1').filter({ hasText: 'Proposal Synthesis' })).toBeVisible({ timeout: 30000 });

    // 7. Verify Data
    await expect(page.getByText('E2E TEST PROJECT')).toBeVisible();
    await expect(page.getByText('Total Cost')).toBeVisible();
});
