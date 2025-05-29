import { test } from '@playwright/test';
import { registerUserStep } from '../steps/account';
import { createFreeProject } from '../steps/free-project';
import { enterCreditCard } from '../steps/pro-project';

test('upgrade - free tier', async ({ page }) => {
    await registerUserStep(page);
    await createFreeProject(page);
    await test.step('upgrade project', async () => {
        await page.getByRole('link', { name: 'Upgrade', exact: true }).click();
        await page.waitForURL(/\/organization-[^/]+\/change-plan/);
        await page.locator('input[value="tier-1"]').click();
        await page.getByRole('button', { name: 'add' }).first().click();
        await enterCreditCard(page);
        // skip members
        await page.getByRole('button', { name: 'change plan' }).click();
        await page.waitForURL(/\/console\/project-(?:[a-z0-9]+-)?([^/]+)\/get-started/);
    });
});
