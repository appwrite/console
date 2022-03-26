import { expect, test } from '@playwright/test';

test('login page has inputs', async ({ page }) => {
    await page.goto('/login');
    const mail = page.locator('id=email');
    const pass = page.locator('id=password');
    expect(await mail.isVisible());
    expect(await pass.isVisible());
});
