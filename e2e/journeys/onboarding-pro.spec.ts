import { test } from '@playwright/test';
import { registerUserStep } from '../steps/account';
import { createProProject } from '../steps/pro-project';

test('onboarding - pro', async ({ page }) => {
    await registerUserStep(page);
    await createProProject(page);
});
