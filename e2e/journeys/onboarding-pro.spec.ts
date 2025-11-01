import { test, expect } from '../fixtures/base';

test.use({ tier: 'pro' });

test('onboarding - pro', async ({ page, project }) => {
    await expect(page).toHaveURL(
        new RegExp(`/project-${project.region}-${project.id}/get-started`)
    );
});
