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

        let region = 'fra'; // for fallback
        const regionPicker = dialog.locator('button[role="combobox"]');
        if (await regionPicker.isVisible()) {
            await regionPicker.click();
            await page.getByRole('option', { name: /New York/i }).click();

            region = 'nyc';
        }

        await dialog.getByRole('button', { name: 'create' }).click();

        await page.waitForURL(new RegExp(`/project-${region}-[^/]+`));
        expect(page.url()).toContain(`/console/project-${region}-`);

        return getProjectIdFromUrl(page.url());
    });

    return {
        id: projectId,
        organizationId
    };
}
