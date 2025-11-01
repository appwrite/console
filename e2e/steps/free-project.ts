import type { ProjectMetadata } from '../fixtures/base';
import { selectRandomRegion } from '../helpers/region';
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

        const region = await selectRandomRegion(page, dialog);

        await dialog.getByRole('button', { name: 'create' }).click();

        await page.waitForURL(/\/project-[^/]+-[^/]+/);
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
