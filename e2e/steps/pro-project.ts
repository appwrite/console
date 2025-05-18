import { test, expect, type Page } from '@playwright/test';
import { getOrganizationIdFromUrl, getProjectIdFromUrl } from '../helpers/url';

type Metadata = {
    id: string;
    organizationId: string;
};

export async function enterCreditCard(page: Page) {
    const dialog = page.locator('.modal').filter({
        hasText: 'add payment method'
    });
    await dialog.waitFor({
        state: 'visible'
    });
    await page.getByPlaceholder('cardholder').fill('Test User');
    const stripe = page.frameLocator('[title="Secure payment input frame"]');
    await stripe.locator('id=Field-numberInput').fill('4242424242424242');
    await stripe.locator('id=Field-expiryInput').fill('1250');
    await stripe.locator('id=Field-cvcInput').fill('123');
    await stripe.locator('id=Field-countryInput').selectOption('DE');
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await dialog.waitFor({
        state: 'hidden'
    });
}

export async function createProProject(page: Page): Promise<Metadata> {
    const organizationId = await test.step('create organization', async () => {
        await page.goto('./create-organization');
        await page.locator('id=name').fill('test org');
        await page.getByLabel('pro').check();
        await page.getByRole('button', { name: 'get started' }).click();
        await page.getByRole('button', { name: 'add' }).first().click();
        await enterCreditCard(page);
        // skip members
        await page.getByRole('button', { name: 'create organization' }).click();
        await page.waitForURL(/\/organization-[^/]+/);

        return getOrganizationIdFromUrl(page.url());
    });

    const projectId = await test.step('create project', async () => {
        await page.waitForURL(/\/organization-[^/]+/);
        await page.getByRole('button', { name: 'create project' }).first().click();
        const dialog = page.locator('dialog[open]');
        await dialog.getByPlaceholder('Project name').fill('test project');
        await dialog.getByRole('button', { name: 'create' }).click();
        await page.waitForURL(/\/project-fra-[^/]+/);
        expect(page.url()).toContain('/console/project-fra-');

        return getProjectIdFromUrl(page.url());
    });

    return {
        id: projectId,
        organizationId
    };
}
