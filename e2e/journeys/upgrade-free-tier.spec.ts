import { test } from '../fixtures/base';
import { enterCreditCard } from '../steps/pro-project';

test('upgrade - free tier', async ({ page }) => {
    await test.step('upgrade project', async () => {
        await page.getByRole('link', { name: 'Upgrade', exact: true }).click();
        await page.waitForURL(/\/organization-[^/]+\/change-plan/);
        await page.locator('input[value="tier-1"]').click();

        await enterCreditCard(page);

        // wait for a second after adding a card to update the UI.
        await page.waitForSelector('button#method[role="combobox"]');

        // skip members
        await page.getByRole('button', { name: 'change plan' }).click();
        await page.waitForURL(/\/console\/project-(?:[a-z0-9]+-)?([^/]+)\/get-started/);
    });
});
