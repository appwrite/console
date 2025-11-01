import { test, type Page, expect } from '@playwright/test';

export async function deleteProject(page: Page, region: string, projectId: string) {
    return test.step('delete project', async () => {
        await page.goto(`./project-${region}-${projectId}/settings`);

        // Get the project name from the data attribute
        const projectName = await page.locator('[data-project-name]').textContent();

        // Click the Delete button in the CardGrid actions section
        await page.getByRole('button', { name: 'Delete', exact: true }).click();

        // Wait for modal to open
        const dialog = page.locator('dialog[open]');
        await expect(dialog).toBeVisible();

        // Type the project name to confirm
        await dialog.locator('#project-name').fill(projectName?.trim() || '');

        // Click the Delete button in the modal
        await dialog.getByRole('button', { name: 'Delete', exact: true }).click();

        // Wait for navigation back to organization
        await page.waitForURL(/\/organization-[^/]+$/);
    });
}

export async function deleteOrganization(page: Page, organizationId: string) {
    return test.step('delete organization', async () => {
        await page.goto(`./organization-${organizationId}/settings`);

        // Get the organization name from the data attribute
        const organizationName = await page.locator('[data-organization-name]').textContent();

        // Click the Delete button in the CardGrid actions section
        await page.getByRole('button', { name: 'Delete', exact: true }).click();

        // Wait for modal to open
        const dialog = page.locator('dialog[open]');
        await expect(dialog).toBeVisible();

        // Type the organization name to confirm
        await dialog.locator('#organization-name').fill(organizationName?.trim() || '');

        // Click the Delete button in the modal
        await dialog.getByRole('button', { name: 'Delete', exact: true }).click();

        // Wait for navigation away from organization (to account/organizations or onboarding)
        await page.waitForURL(/\/(account\/organizations|onboarding\/create-organization)/);
    });
}

export async function deleteAccount(page: Page, maxRetries = 3) {
    return test.step('delete account', async () => {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            await page.goto('./account');

            // click the Delete button in the CardGrid actions section
            await page.getByRole('button', { name: 'Delete', exact: true }).click();

            // wait for confirm modal to open
            const dialog = page.locator('dialog[open]');
            await expect(dialog).toBeVisible();

            // click the confirm button in the modal (no name typing required)
            await dialog.getByRole('button', { name: 'Delete', exact: true }).click();

            // check if we got an error about active memberships
            const membershipError = page.getByText(/active memberships/i);
            const errorVisible = await membershipError
                .isVisible({ timeout: 2000 })
                .catch(() => false);

            if (errorVisible) {
                console.log(
                    `Attempt ${attempt + 1}: Account deletion failed due to active memberships. Retrying...`
                );

                await page.keyboard.press('Escape').catch(() => {});
                await page.waitForTimeout(2000);
                continue;
            }
            return;
        }

        throw new Error(
            'Failed to delete account after multiple retries due to active memberships'
        );
    });
}

export async function cleanupTestAccount(
    page: Page,
    region: string,
    projectId: string,
    organizationId: string
) {
    return test.step('cleanup test account', async () => {
        try {
            await deleteProject(page, region, projectId);
        } catch (error) {
            console.log('Failed to delete project:', error);
        }

        try {
            await deleteOrganization(page, organizationId);
        } catch (error) {
            console.log('Failed to delete organization:', error);
        }

        try {
            await deleteAccount(page);
        } catch (error) {
            console.log('Failed to delete account:', error);
        }
    });
}
