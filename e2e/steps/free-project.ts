import type { ProjectMetadata } from '../fixtures/base';
import { test, expect, type Page } from '@playwright/test';
import { getOrganizationIdFromUrl, getProjectIdFromUrl } from '../helpers/url';

export async function createFreeProject(page: Page): Promise<ProjectMetadata> {
    const organizationId = await test.step('create organization', async () => {
        await page.goto('./');
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

        return {
            projectId: getProjectIdFromUrl(page.url()),
            region
        };
    });

    return {
        id: projectId,
        organizationId,
        region
    };
}
