import { test as base } from '@playwright/test';
import { cleanupTestAccount } from '../helpers/delete';

import { registerUserStep } from '../steps/account';
import { createFreeProject } from '../steps/free-project';
import { createProProject } from '../steps/pro-project';

export type ProjectMetadata = {
    id: string;
    region: string;
    organizationId: string;
};

type ProjectFixtures = {
    project: ProjectMetadata;
    tier: 'free' | 'pro' | 'scale' /* for later */;
};

export const test = base.extend<ProjectFixtures>({
    tier: ['free', { option: true }],
    project: [
        async ({ page, tier }, use) => {
            await registerUserStep(page);

            let project: ProjectMetadata;
            switch (tier) {
                case 'free':
                    project = await createFreeProject(page);
                    break;
                case 'pro':
                case 'scale':
                    project = await createProProject(page);
                    break;
            }

            await use(project);

            await cleanupTestAccount(page, project.region, project.id, project.organizationId);
        },
        { auto: true }
    ]
});

export { expect } from '@playwright/test';
