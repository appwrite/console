import { expect, test } from '@playwright/test';

/*TODO: Things to test in login:
    - presence of forgot password link
    - validation message on wrong input
    - correct response and redirect after login 
    - logout works
    - back button does not log out user
    - forward button does not log in user after logout
    - limit to total number of login attempts
    - 
*/

test('login page has inputs and button', async ({ page }) => {
    await page.goto('/login');
    const mail = page.locator('id=email');
    const pass = page.locator('id=password');
    const button = page.locator('button:has-text("Sign in")');
    expect(await mail.isVisible());
    expect(await pass.isVisible());
    expect(await button.isVisible());
});

test('login page has a working sign up link', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(100);
    const signup = page.locator('a[href="/register"]');
    expect(await signup.isVisible());
});

test('login page inputs are navigable by keyboard', async ({ page }) => {
    await page.goto('/login');
    const mail = page.locator('id=email');
    await mail.focus();
    await page.keyboard.type('wrongemail@apppwrite.io');
    await page.keyboard.press('Tab');
    await page.keyboard.type('password');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    expect(await page.locator('.toaster-item').isVisible());
    expect(await page.locator('text=Invalid credentials').isVisible());
});

test('login page shows error & response is 401 with wrong inputs', async ({ page }) => {
    await page.goto('/login');
    await page.fill('id=email', 'wrongemail@apppwrite.io');
    await page.fill('id=password', 'wrongpassword');
    await page.click('button:has-text("Sign in")');
    page.on('response', (response) => {
        expect(response.status()).toBe(401);
    });
    expect(await page.locator('.toaster-item').isVisible());
    expect(await page.locator('text=Invalid credentials').isVisible());
});
