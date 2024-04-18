import { test, expect, type Page } from '@playwright/test';
import { getOrganizationIdFromUrl, getProjectIdFromUrl } from '../helpers/url';

type Metadata = {
    id: string;
    organizationId: string;
};

export async function createFreeProject(page: Page): Promise<Metadata> {
    const organizationId = await test.step('create organization', async () => {
        await page.goto('/console');
        await page.waitForURL('/console/onboarding');
        await page.locator('id=name').fill('test org');
        await page.locator('id=plan').selectOption('tier-0');
        await page.getByRole('button', { name: 'get started' }).click();
        await page.waitForURL('/console/organization-**');
        return getOrganizationIdFromUrl(page.url());
    });

    const projectId = await test.step('create project', async () => {
        await page.waitForURL('/console/organization-**');
        await page.getByRole('button', { name: 'create project' }).first().click();
        await page.locator('id=name').fill('test project');
        await page.getByRole('button', { name: 'next' }).click();
        await page.locator('label').filter({ hasText: 'Frankfurt' }).click();
        await page.getByRole('button', { name: 'create' }).click();
        await page.waitForURL('/console/project-**/overview/platforms');
        expect(page.url()).toContain('/console/project-');

        return getProjectIdFromUrl(page.url());
    });

    return {
        id: projectId,
        organizationId
    };
}
