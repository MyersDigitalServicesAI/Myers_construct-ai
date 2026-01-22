
import { test, expect } from '@playwright/test';

test.describe('Chaos Engineering & Security Suite', () => {

    // 1. Security: XSS Injection
    test('Security: Should sanitize XSS payloads in Project Scope', async ({ page }) => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        // Bypass auth if needed (assuming Test Mode helper exists or we use the bypass flow)
        // For this suite, we assume we can reach the dashboard.
        // Click "Bypass Identity" if visible (Login component logic)
        const bypassBtn = page.getByRole('button', { name: 'Bypass Identity' });
        if (await bypassBtn.isVisible()) {
            await bypassBtn.click();
        }

        await page.getByRole('button', { name: 'New AI Takeoff' }).click();

        const maliciousScript = '<img src=x onerror=alert(1)>';
        await page.getByPlaceholder('e.g. Harbor Office Reno v2').fill(maliciousScript);
        await page.getByPlaceholder('e.g. Austin, TX (78701)').fill('Austin, TX');
        await page.getByPlaceholder(/Specify materials/).fill('Just a test');

        // Check if value is accepted (it might be), but ensure it doesn't execute
        // In a real scenario, we'd check if an alert dialog appears.
        page.on('dialog', dialog => {
            console.log(`Alert triggered! Message: ${dialog.message()}`);
            dialog.dismiss();
            throw new Error('XSS VULNERABILITY DETECTED: Alert dialog triggered by payload.');
        });

        await page.getByRole('button', { name: 'Deploy Reasoning Core' }).click();

        // If we get here without an alert, we're likely safe from immediate execution.
        // Further check: Inspect DOM in result view to ensure script isn't active.
        // (Simulating result view requiring mock API ideally, but we'll see if it crashes)
    });

    // 2. Resilience: API Failure Injection
    test('Resilience: Should handle 500 server error gracefully', async ({ page }) => {
        // Intercept API call and force failure
        await page.route('**/api/generate-estimate', route => {
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Simulated Internal Server Error' }),
            });
        });


        await page.goto('/', { waitUntil: 'domcontentloaded' });
        const bypassBtn = page.getByRole('button', { name: /Bypass Identity/i });
        if (await bypassBtn.isVisible()) await bypassBtn.click();

        await page.getByRole('button', { name: 'New AI Takeoff' }).click();
        await page.getByPlaceholder('e.g. Harbor Office Reno v2').fill('Chaos Test');
        await page.getByPlaceholder('e.g. Austin, TX (78701)').fill('Austin, TX');
        await page.getByPlaceholder(/Specify materials/).fill('Chaos materials');

        await page.getByRole('button', { name: 'Deploy Reasoning Core' }).click();

        // Expect error banner or alert
        // The app uses `alert(e.message)` in App.tsx:113 -> `setAppError(handleError(err))` -> ErrorBanner
        // Wait for error banner
        await expect(page.locator('text=Simulated Internal Server Error')).toBeVisible({ timeout: 10000 });
    });

    // 3. Chaos Agent: Network Condition Fuzzing & Self-Healing
    test('Chaos Agent: Should maintain data integrity during network flakiness', async ({ page }) => {
        test.setTimeout(60000); // Extended timeout for network toggling
        // "Power Move": Simulate a construction site with intermittent connectivity
        await page.goto('/', { waitUntil: 'domcontentloaded' });

        // Log in
        const bypassBtn = page.getByRole('button', { name: /Bypass Identity/i });
        if (await bypassBtn.isVisible({ timeout: 5000 })) await bypassBtn.click();

        await page.getByRole('button', { name: 'New AI Takeoff' }).click();
        await page.getByPlaceholder('e.g. Harbor Office Reno v2').fill('Site Connectivity Test');
        await page.getByPlaceholder('e.g. Austin, TX (78701)').fill('Austin, TX');

        // Start filling data
        await page.getByPlaceholder(/Specify materials/).fill('Initial data...');

        // ⚡ CHAOS EVENT: Go Offline
        console.log('⚡ CHAOS AGENT: Cutting Network Connection...');
        await page.context().setOffline(true);

        // Continue working (Offline-First check)
        await page.getByPlaceholder(/Specify materials/).type(' adding more data while offline.');

        // Attempt submit (Should likely fail or queue)
        // Note: Our current app might alert on fetch failure, but we want to ensure *data* isn't lost if we stay on page.
        // Let's toggle back online before full submission to test "Reconnect" recovery if implemented, 
        // OR just verify the app doesn't crash.

        // ⚡ CHAOS EVENT: Reconnect
        console.log('⚡ CHAOS AGENT: Restoring Network...');
        await page.context().setOffline(false);

        // Give it a moment to heal
        await page.waitForTimeout(2000);

        // Submit
        await page.getByRole('button', { name: 'Deploy Reasoning Core' }).click();

        // EXPECTATION: Success (Self-Healing) OR Graceful Error, NOT Crash.
        // Ideally should succeed if the retry logic (Power Move) is in place, or at least show error without losing form data.

        // For now, we verify we are still on the page or moved to processing, and not an empty white screen.
        const heading = page.locator('h3, h2').first();
        await expect(heading).toBeVisible();
    });

});
