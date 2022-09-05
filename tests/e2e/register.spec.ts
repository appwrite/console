import { expect, test } from '@playwright/test';

test('register page has inputs', async ({ page }) => {
    await page.goto('/register');
    const name = page.locator('id=name');
    const mail = page.locator('id=email');
    const pass = page.locator('id=password');
    expect(await name.isVisible());
    expect(await mail.isVisible());
    expect(await pass.isVisible());
});
