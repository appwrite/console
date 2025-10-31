import { test, expect } from '../fixtures/base';

test('onboarding - free tier', async ({ page, project }) => {
    await expect(page).toHaveURL(
        new RegExp(`/project-${project.region}-${project.id}/get-started`)
    );
});
