import { test } from '@playwright/test';
import { registerUserStep } from '../steps/account';
import { createFreeProject } from '../steps/free-project';
import { enterAddress, enterCreditCard } from '../steps/pro-project';

test('upgrade - free tier', async ({ page }) => {
    await registerUserStep(page);
    await createFreeProject(page);
    await page.getByRole('button', { name: 'Upgrade' }).click();
    await page.locator('input[value="tier-1"]').click();
    await page.getByRole('button', { name: 'Next' }).click();
    await enterCreditCard(page);
    await enterAddress(page);
    // skip members
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Start trial' }).click();
    await page.waitForURL('/console/organization-**');
});
