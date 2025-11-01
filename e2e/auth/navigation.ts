import { test, type Page } from '@playwright/test';

export function buildAuthUrl(region: string, projectId: string, path: string = ''): string {
    return `./project-${region}-${projectId}/auth${path}`;
}

export function buildAuthUrlPattern(region: string, projectId: string, path: string = ''): RegExp {
    return new RegExp(`/project-${region}-${projectId}/auth${path}`);
}

export async function navigateToUsers(
    page: Page,
    region: string,
    projectId: string
): Promise<void> {
    return test.step('navigate to users', async () => {
        const expectedPattern = new RegExp(`/project-${region}-${projectId}/auth(/\\?.*)?$`);
        if (expectedPattern.test(page.url())) {
            return;
        }

        await page.goto(buildAuthUrl(region, projectId));
        await page.waitForURL(buildAuthUrlPattern(region, projectId));
        await page.getByRole('heading', { name: 'Auth' }).waitFor({ state: 'visible' });
    });
}

export async function navigateToUser(
    page: Page,
    region: string,
    projectId: string,
    userId: string
): Promise<void> {
    return test.step(`navigate to user ${userId}`, async () => {
        const expectedPattern = new RegExp(
            `/project-${region}-${projectId}/auth/user-${userId}(/\\?.*)?$`
        );

        if (expectedPattern.test(page.url())) {
            return;
        }

        await page.goto(buildAuthUrl(region, projectId, `/user-${userId}`));
        await page.waitForURL(buildAuthUrlPattern(region, projectId, `/user-${userId}`));
        await page.locator('input[id="name"]').waitFor({ state: 'attached' });
    });
}

export async function navigateToTeams(
    page: Page,
    region: string,
    projectId: string
): Promise<void> {
    return test.step('navigate to teams', async () => {
        await page.goto(buildAuthUrl(region, projectId, '/teams'));
        await page.waitForURL(buildAuthUrlPattern(region, projectId, '/teams'));
    });
}

export async function navigateToTeam(
    page: Page,
    region: string,
    projectId: string,
    teamId: string
): Promise<void> {
    return test.step(`navigate to team ${teamId}`, async () => {
        await page.goto(buildAuthUrl(region, projectId, `/teams/team-${teamId}`));
        await page.waitForURL(buildAuthUrlPattern(region, projectId, `/teams/team-${teamId}`));
    });
}

export async function navigateToSecurity(
    page: Page,
    region: string,
    projectId: string
): Promise<void> {
    return test.step('navigate to security settings', async () => {
        await page.goto(buildAuthUrl(region, projectId, '/security'));
        await page.waitForURL(buildAuthUrlPattern(region, projectId, '/security'));
    });
}

export async function navigateToTemplates(
    page: Page,
    region: string,
    projectId: string
): Promise<void> {
    return test.step('navigate to templates', async () => {
        await page.goto(buildAuthUrl(region, projectId, '/templates'));
        await page.waitForURL(buildAuthUrlPattern(region, projectId, '/templates'));
    });
}
