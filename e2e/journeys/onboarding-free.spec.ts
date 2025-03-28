import { test } from '@playwright/test';
import { registerUserStep } from '../steps/account';
import { createFreeProject } from '../steps/free-project';

test('onboarding - free tier', async ({ page }) => {
    await registerUserStep(page);
    await createFreeProject(page);
});
