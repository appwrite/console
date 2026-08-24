import { test, type Page } from '@playwright/test';

type Metadata = {
    name: string;
    email: string;
    password: string;
};

export function registerUserStep(page: Page): Promise<Metadata> {
    return test.step('register user', async () => {
        const seed = crypto.randomUUID();
        await page.goto('./register');
        const inputs = {
            name: page.locator('id=name'),
            email: page.locator('id=email'),
            password: page.locator('id=password'),
            terms: page.locator('id=terms')
        };
        const values = {
            name: 'testuser ' + seed,
            email: 'testuser+' + seed + '@apppwrite.io',
            password: 'testuser+' + seed + '@apppwrite.io'
        };
        await inputs.name.fill(values.name);
        await inputs.email.fill(values.email);
        await inputs.password.fill(values.password);
        await inputs.terms.check({ force: true });
        await page.getByRole('button', { name: 'Sign up', exact: true }).click();

        const postSignup =
            /\/(onboarding\/create-project|onboarding\/create-organization|verify-email|organization-)/;
        try {
            await page.waitForURL(postSignup, { timeout: 60000 });
        } catch {
            const toast = await page
                .locator('[role="alert"], [role="status"]')
                .first()
                .textContent({ timeout: 1000 })
                .catch(() => '');
            throw new Error(
                `Signup did not navigate away from the register page. url=${page.url()} toast=${toast?.trim() ?? ''}`
            );
        }

        if (page.url().includes('/verify-email')) {
            test.skip(
                true,
                'Staging requires console email verification; onboarding e2e cannot continue.'
            );
        }

        return values;
    });
}
