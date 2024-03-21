import { test, expect } from '@playwright/test';
import { registerUserStep } from '../steps/account';

test('onboarding - free tier', async ({ page }) => {
    await registerUserStep(page);

    await test.step('create organization', async () => {
        await page.goto('/console');
        await page.waitForURL('/console/onboarding');
        const name = page.locator('id=name');
        const plan = page.locator('id=plan');
        name.fill('test org');
        plan.selectOption('tier-0');
        await page.getByRole('button', { name: 'Get started' }).click();
        await page.waitForURL('/console/organization-**');
    });

    await test.step('create project', async () => {
        await page.waitForURL('/console/organization-**');
        await page.getByRole('article').getByRole('button', { name: 'Create project', exact: true }).click();
        await page.getByPlaceholder('Project name').click();
        await page.getByPlaceholder('Project name').fill('Test Project');
        await page.getByRole('button', { name: 'Next' }).click();
        await page.locator('label').filter({ hasText: 'Frankfurt' }).click();
        await page.getByRole('button', { name: 'Create' }).click();
        await page.waitForURL('/console/project-**/overview/platforms');
        expect(page.url()).toContain('/console/project-');
    });
});

test('onboarding - pro', async ({ page }) => {
    await registerUserStep(page);

    await test.step('create organization', async () => {
        await page.goto('/console');
        await page.waitForURL('/console/onboarding');
        await page.locator('id=name').fill('test org');
        await page.locator('id=plan').selectOption('tier-1');
        await page.getByRole('button', { name: 'Get started' }).click();
        // enter credit card
        await page.getByPlaceholder('Cardholder name').fill('Test User');
        const stripe = page.frameLocator('[title="Secure payment input frame"]');
        await stripe.locator('id=Field-numberInput').fill('4242424242424242');
        await stripe.locator('id=Field-expiryInput').fill('1250');
        await stripe.locator('id=Field-cvcInput').fill('123');
        await stripe.locator('id=Field-countryInput').selectOption('LV');
        await page.getByRole('button', { name: 'Next' }).click();
        // enter address
        await page.locator('id=country').selectOption('LV');
        await page.locator('id=address').fill('123 Test St');
        await page.locator('id=city').fill('Test City');
        await page.locator('id=state').fill('Test State');
        await page.getByRole('button', { name: 'Next' }).click();
        // skip members
        await page.getByRole('button', { name: 'Next' }).click();
        // start pro trial
        await page.getByRole('button', { name: 'Start trial' }).click();
        await page.waitForURL('/console/organization-**');
    });

    await test.step('create project', async () => {
        await page.waitForURL('/console/organization-**');
        await page.getByRole('article').getByRole('button', { name: 'Create project', exact: true }).click();
        await page.getByPlaceholder('Project name').click();
        await page.getByPlaceholder('Project name').fill('Test Project');
        await page.getByRole('button', { name: 'Next' }).click();
        await page.locator('label').filter({ hasText: 'Frankfurt' }).click();
        await page.getByRole('button', { name: 'Create' }).click();
        await page.waitForURL('/console/project-**/overview/platforms');
        expect(page.url()).toContain('/console/project-');
    });
});
