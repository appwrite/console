import type { ProjectMetadata } from '../fixtures/base';
import { test, expect, type Page } from '@playwright/test';
import { getOrganizationIdFromUrl, getProjectIdFromUrl } from '../helpers/url';

export async function enterCreditCard(page: Page) {
    // click the `add` button inside correct view layer
    await page
        .locator('#no-payments-card-stack')
        .getByRole('button', { name: 'add' })
        .first()
        .click();

    const dialog = page.locator('.modal').filter({ hasText: 'add payment method' });
    await dialog.waitFor({ state: 'visible' });
    await page.getByPlaceholder('cardholder').fill('Test User');
    const stripe = page.locator('[title="Secure payment input frame"]').nth(0).contentFrame();
    await stripe.locator('id=Field-numberInput').fill('4242424242424242');
    await stripe.locator('id=Field-expiryInput').fill('1250');
    await stripe.locator('id=Field-cvcInput').fill('123');
    await stripe.locator('id=Field-countryInput').selectOption('DE');
    await dialog.getByRole('button', { name: 'Add', exact: true }).click();
    await page.locator('id=state-picker').click(); // open dropdown
    await page.getByRole('option', { name: 'Alabama' }).click();
    await dialog.getByRole('button', { name: 'Add', exact: true }).click();
    await dialog.waitFor({
        state: 'hidden'
    });
}

export async function createProProject(page: Page): Promise<ProjectMetadata> {
    const organizationId = await test.step('create organization', async () => {
        await page.goto('./create-organization');
        await page.locator('id=name').fill('test org');
        await page.getByRole('radio', { name: /^Pro\b/ }).check();
        // `create organization` because there's already free created on start!
        await page.getByRole('button', { name: 'create organization' }).click();
        await enterCreditCard(page);
        // skip members
        await page.getByRole('button', { name: 'create organization' }).click();
        await page.waitForURL(/\/organization-[^/]+/);

        return getOrganizationIdFromUrl(page.url());
    });

    const { projectId, region } = await test.step('create project', async () => {
        await page.waitForURL(/\/organization-[^/]+/);
        await page.getByRole('button', { name: 'create project' }).first().click();
        const dialog = page.locator('dialog[open]');

        await dialog.getByPlaceholder('Project name').fill('test project');

        let region = 'fra';
        // @ts-expect-error - process.env is available in Node.js test environment
        const isMultiRegion = process.env.PUBLIC_APPWRITE_MULTI_REGION === 'true';

        if (isMultiRegion) {
            const regionPicker = dialog.locator('button[role="combobox"]');
            if (await regionPicker.isVisible()) {
                await regionPicker.click();

                // get all available/enabled region options
                const options = await page.getByRole('option').all();
                if (options.length > 0) {
                    // select a random region
                    const randomIndex = Math.floor(Math.random() * options.length);
                    await options[randomIndex].click();
                }
            }
        }

        await dialog.getByRole('button', { name: 'create' }).click();

        // wait for URL and extract actual region from it
        await page.waitForURL(/\/project-[^/]+-[^/]+/);
        const urlMatch = page.url().match(/\/project-([^-]+)-/);
        if (urlMatch) {
            region = urlMatch[1];
        }
        expect(page.url()).toContain(`/console/project-${region}-`);

        return { projectId: getProjectIdFromUrl(page.url()), region };
    });

    return {
        id: projectId,
        organizationId,
        region
    };
}
