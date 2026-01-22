import { test, expect } from '@playwright/test';

test('Subscription Flow', async ({ page }) => {
    test.setTimeout(60000); // Increase timeout for complex flow

    // 2. Go to URL
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 3. Handle Login Bypass
    // Wait for either the trial badge (logged in as guest) or the login bypass button
    // This makes the test resilient to initial auth state latency
    const bypassBtn = page.getByRole('button', { name: /Bypass Identity/i });
    if (await bypassBtn.isVisible({ timeout: 5000 })) {
        await bypassBtn.click();
    }

    // 4. Navigate to Pricing
    // Use robust selector based on the "Trial Mode" badge triggering the view change? 
    // Actually key logic in App.tsx is that clicking "Trial Mode" doesn't do anything, but restricted features do.
    // OR we can click an explicit "Unlock" button found in restricted overlays.

    // Alternative: We navigate via a restricted feature "Voice Agent Node" which is Pro only
    await page.getByText('Voice Agent Node').click();

    // Wait for the lock icon or upgrade prompt if not on Pro
    // But checking for 'Upgrade to Pro' button directly is safer if we know where it is.
    // Let's assume we want to trigger the pricing view explicitly.
    // We can add a "View Upgrade Options" button in the Dashboard for Trial users? 
    // Or just click the "Voice Agent Node" which has a "Pro Feature" lock.

    // Clicking the Restricted Overlay button
    // The overlay appears when viewing a restricted result or feature.
    // Let's just create a dummy project to get to a restricted result? No that's too slow.

    // EASIEST PATH: The "Trial Mode" badge isn't clickable in App.tsx code above (I just checked).
    // BUT "UserPlan.STARTER" is the default.
    // Let's click the "Voice Agent Node" card which calls `handleGatedView('agent', 'canUseIntegrations')`
    // This will redirect to 'pricing' view if user is on Starter.

    // Click Voice Agent Card
    await page.getByTestId('voice-agent-card').click();

    // 5. Select Pro Plan
    // Now we should be on the Pricing View.
    // Wait for the Pro Plan card to be visible
    const proPlanCard = page.locator('div').filter({ hasText: 'Pro' }).last();
    // Wait for the specific upgrade button
    const activateBtn = proPlanCard.getByRole('button', { name: /Upgrade to Pro/i });
    await expect(activateBtn).toBeVisible({ timeout: 10000 });
    await activateBtn.click();

    // 6. Expect Embedded Checkout iframe
    await expect(page.locator('iframe')).toBeVisible({ timeout: 20000 });
});
