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
        const name = page.locator('id=name');
        const plan = page.locator('id=plan');
        name.fill('test org');
        plan.selectOption('tier-0');
        await page.getByRole('button', { name: 'Get started' }).click();
        await page.waitForURL('/console/organization-**');
        return getOrganizationIdFromUrl(page.url());
    });

    const projectId = await test.step('create project', async () => {
        await page.waitForURL('/console/organization-**');
        await page
            .getByRole('article')
            .getByRole('button', { name: 'Create project', exact: true })
            .click();
        await page.getByPlaceholder('Project name').click();
        await page.getByPlaceholder('Project name').fill('Test Project');
        await page.getByRole('button', { name: 'Next' }).click();
        await page.locator('label').filter({ hasText: 'Frankfurt' }).click();
        await page.getByRole('button', { name: 'Create' }).click();
        await page.waitForURL('/console/project-**/overview/platforms');
        expect(page.url()).toContain('/console/project-');

        return getProjectIdFromUrl(page.url());
    });

    return {
        id: projectId,
        organizationId
    };
}
