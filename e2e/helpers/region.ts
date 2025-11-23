import type { Page, Locator } from '@playwright/test';

export async function selectRandomRegion(page: Page, dialog: Locator): Promise<string> {
    if (process.env.PUBLIC_APPWRITE_MULTI_REGION !== 'true') return 'fra';

    const regionPicker = dialog.locator('button[role="combobox"]');
    if (await regionPicker.isVisible()) {
        await regionPicker.click();

        const allOptions = await page.getByRole('option').all();
        const options = [];

        for (const option of allOptions) {
            const isDisabled = await option.getAttribute('aria-disabled');
            if (isDisabled !== 'true') {
                options.push(option);
            }
        }

        if (options.length > 0) {
            const randomIndex = Math.floor(Math.random() * options.length);
            const selectedOption = options[randomIndex];

            const regionCode =
                (await selectedOption.getAttribute('data-value')) ||
                (await selectedOption.getAttribute('value'));

            await selectedOption.click();

            // remove quotes if present in the attribute value
            const cleanedRegionCode = regionCode?.replace(/^["']|["']$/g, '');

            return cleanedRegionCode || 'fra';
        }
    }

    return 'fra';
}
