import { test, expect, type Page } from '@playwright/test';
import { getOrganizationIdFromUrl, getProjectIdFromUrl } from '../helpers/url';

type Metadata = {
    id: string;
    organizationId: string;
};

export async function createFreeProject(page: Page): Promise<Metadata> {
    const organizationId = await test.step('create organization', async () => {
        await page.goto('./');
        await page.waitForURL(/\/organization-[^/]+/);
        return getOrganizationIdFromUrl(page.url());
    });

    const projectId = await test.step('create project', async () => {
        await page.waitForURL(/\/organization-[^/]+/);
        await page.getByRole('button', { name: 'create project' }).first().click();
        const dialog = page.locator('dialog[open]');
        await dialog.getByPlaceholder('Project name').fill('test project');
        const regionSelector = dialog.getByPlaceholder('Select a region');
        await regionSelector.click();
        await dialog.getByRole('option', { name: 'New York' }).click();

        await dialog.getByRole('button', { name: 'create' }).click();
        await page.waitForURL(/\/project-[^/]+-[^/]+/);
        expect(page.url()).toMatch(/\/console\/project-[^/]+-/);

        return getProjectIdFromUrl(page.url());
    });

    return {
        id: projectId,
        organizationId
    };
}
