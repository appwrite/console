import { test, type Page } from '@playwright/test';

export function registerUserStep(page: Page) {
    return test.step('Register User', async () => {
        const seed = Date.now();
        await page.goto('/register');
        await page.getByRole('button', { name: 'Only required', exact: true }).click();
        const name = page.locator('id=name');
        const mail = page.locator('id=email');
        const pass = page.locator('id=password');
        const terms = page.locator('id=terms');
        await name.fill('testuser ' + seed);
        await mail.fill('testuser+' + seed + '@apppwrite.io');
        await pass.fill('testuser+' + seed + '@apppwrite.io');
        await terms.check();
        await page.getByRole('button', { name: 'Sign up', exact: true }).click();
        await page.waitForURL('/console/onboarding');
    });
}
