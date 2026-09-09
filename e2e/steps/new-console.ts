import { test, expect, type Page } from '@playwright/test';

export function dismissNewConsolePromotion(page: Page) {
    return test.step('dismiss new Console promotion after onboarding', async () => {
        const dialog = page.getByRole('dialog', { name: 'The new Appwrite Console' });
        await expect(dialog).toBeVisible();
        await dialog.getByRole('button', { name: 'Stay here for now' }).click();
        await expect(dialog).toHaveCount(0);
    });
}
