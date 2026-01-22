import { test, expect } from '@playwright/test';

test('Estimate Limit Enforcement', async ({ page }) => {
    test.setTimeout(90000);
    // Listen for alert dialogs
    let alertMessage = '';
    page.on('dialog', async dialog => {
        alertMessage = dialog.message();
        await dialog.dismiss();
    });

    await page.goto('/');

    // 1. Bypass Login
    if (await page.getByText('[TEST MODE] Bypass Identity').isVisible()) {
        await page.getByText('[TEST MODE] Bypass Identity').click();
    }

    test.setTimeout(60000);

    // 2. Ensure we are logged in and on Starter plan
    await expect(page.getByText('Command Node')).toBeVisible({ timeout: 15000 });
    // Note: Plan name might be hidden on small screens, so we check for desktop view or specific element presence
    if (await page.viewportSize()?.width! > 640) {
        await expect(page.getByText('Starter')).toBeVisible();
    }

    // 3. Create 3 Estimates
    // We'll use a loop to fill and submit
    for (let i = 1; i <= 3; i++) {
        await page.getByRole('button', { name: /New AI Takeoff/i }).click();
        await page.getByPlaceholder('e.g. Austin, TX (78701)').fill('Test Location');
        await page.getByPlaceholder('e.g. Harbor Office Reno v2').fill(`Estimate ${i}`);
        await page.getByPlaceholder(/Specify materials/).fill('Standard testing scope narrative.');

        // Submit
        await page.getByRole('button', { name: /Deploy Reasoning Core/i }).click();

        // Wait for synthesis result
        await expect(page.getByText('Proposal Synthesis')).toBeVisible({ timeout: 30000 });

        // Return to command node (nav logo)
        await page.locator('nav').getByText(/Myers/).first().click();
        await expect(page.getByText('Command Node')).toBeVisible();
    }

    // 4. Attempt 4th Estimate
    await page.getByRole('button', { name: /New AI Takeoff/i }).click();
    await page.getByPlaceholder('e.g. Austin, TX (78701)').fill('Limit Test');
    await page.getByPlaceholder('e.g. Harbor Office Reno v2').fill('Estimate 4');
    await page.getByPlaceholder(/Specify materials/).fill('This should fail due to tier limits.');

    await page.getByRole('button', { name: /Deploy Reasoning Core/i }).click();

    // 5. Verify Alert Message
    // Since alert is synchronous, it should have been caught by the listener
    // We might need a small wait or check after click
    await page.waitForTimeout(2000); // Give alert time to pop
    expect(alertMessage).toContain('Plan limit reached');
});
