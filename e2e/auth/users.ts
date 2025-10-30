import { test, expect, type Page } from '@playwright/test';
import { navigateToUsers, navigateToUser, buildAuthUrlPattern } from './navigation';

export type CreateUserOptions = {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    userId?: string;
};

export type UserMetadata = {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
};

export type UserPrefs = {
    [key: string]: string;
};

export async function createUser(
    page: Page,
    region: string,
    projectId: string,
    options: CreateUserOptions = {}
): Promise<UserMetadata> {
    return test.step('create user', async () => {
        await navigateToUsers(page, region, projectId);

        await page.getByRole('button', { name: 'Create user' }).first().click();

        const modal = page.locator('dialog[open]').filter({ hasText: 'Create user' });
        await modal.waitFor({ state: 'visible' });

        if (options.name) {
            await modal.locator('id=name').fill(options.name);
        }

        if (options.email) {
            await modal.locator('id=email').fill(options.email);
        }

        if (options.phone) {
            await modal.locator('id=phone').fill(options.phone);
        }

        if (options.password) {
            await modal.locator('id=password').fill(options.password);
        }

        if (options.userId) {
            await modal.getByText('User ID').click();
            await modal.locator('id=id').fill(options.userId);
        }

        await modal.getByRole('button', { name: 'Create', exact: true }).click();
        await modal.waitFor({ state: 'hidden' });
        await expect(page.getByText(/has been created/i)).toBeVisible();
        await page.waitForURL(/\/auth\/user-[^/]+$/);

        const currentUrl = page.url();
        const userIdMatch = currentUrl.match(/\/auth\/user-([^/]+)/);
        const userId = userIdMatch ? userIdMatch[1] : options.userId || '';

        if (options.name) {
            await expect(page.locator('input[id="name"]')).toHaveValue(options.name);
        }
        if (options.email) {
            await expect(page.locator('input[id="email"]')).toHaveValue(options.email);
        }
        if (options.phone) {
            await expect(page.locator('input[id="phone"]')).toHaveValue(options.phone);
        }

        return {
            id: userId,
            name: options.name,
            email: options.email,
            phone: options.phone
        };
    });
}

export async function searchUser(page: Page, query: string): Promise<void> {
    return test.step(`search user: ${query}`, async () => {
        const searchInput = page.getByPlaceholder(/Search by name, email, phone, or ID/i);
        await searchInput.clear();
        await searchInput.fill(query);
        await searchInput.press('Enter');
        await page.waitForURL(/[?&]search=/);
        await expect(searchInput).toHaveValue(query);
    });
}

export async function deleteUser(
    page: Page,
    region: string,
    projectId: string,
    userId: string
): Promise<void> {
    return test.step(`delete user ${userId}`, async () => {
        await navigateToUser(page, region, projectId, userId);

        await page.getByRole('heading', { name: 'Delete user' }).scrollIntoViewIfNeeded();
        await page.getByRole('button', { name: 'Delete', exact: true }).first().click();

        const dialog = page.locator('dialog[open]');
        await dialog.waitFor({ state: 'visible' });
        await dialog.getByRole('button', { name: 'Delete', exact: true }).click();

        await page.waitForURL(buildAuthUrlPattern(region, projectId, '$'));
        await expect(page.getByText(/has been deleted/i)).toBeVisible();

        await searchUser(page, userId);
        const userRow = page.locator('[role="row"]').filter({ hasText: userId });
        await expect(userRow).not.toBeVisible();

        await page.getByPlaceholder(/Search by name, email, phone, or ID/i).clear();
    });
}

export async function updateUserName(
    page: Page,
    region: string,
    projectId: string,
    userId: string,
    newName: string
): Promise<void> {
    return test.step(`update user name to: ${newName}`, async () => {
        await navigateToUser(page, region, projectId, userId);

        const nameSection = page.locator('form').filter({
            has: page.getByRole('heading', { name: 'Name' })
        });
        await nameSection.locator('id=name').fill(newName);
        await nameSection.getByRole('button', { name: 'Update' }).click();
        await expect(page.getByText(/has been updated/i)).toBeVisible();

        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('input[id="name"]')).toHaveValue(newName);
    });
}

export async function updateUserEmail(
    page: Page,
    region: string,
    projectId: string,
    userId: string,
    newEmail: string
): Promise<void> {
    return test.step(`update user email to: ${newEmail}`, async () => {
        await navigateToUser(page, region, projectId, userId);

        const emailSection = page.locator('form').filter({
            has: page.getByRole('heading', { name: 'Email' })
        });
        await emailSection.locator('id=email').fill(newEmail);
        await emailSection.getByRole('button', { name: 'Update' }).click();
        await expect(page.getByText(/has been updated/i)).toBeVisible();

        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('input[id="email"]')).toHaveValue(newEmail);
    });
}

export async function updateUserPhone(
    page: Page,
    region: string,
    projectId: string,
    userId: string,
    newPhone: string
): Promise<void> {
    return test.step(`update user phone to: ${newPhone}`, async () => {
        await navigateToUser(page, region, projectId, userId);

        const phoneSection = page.locator('form').filter({
            has: page.getByRole('heading', { name: 'Phone' })
        });
        await phoneSection.locator('id=phone').fill(newPhone);
        await phoneSection.getByRole('button', { name: 'Update' }).click();
        await expect(page.getByText(/has been updated/i)).toBeVisible();

        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('input[id="phone"]')).toHaveValue(newPhone);
    });
}

export async function updateUserPassword(
    page: Page,
    region: string,
    projectId: string,
    userId: string,
    newPassword: string
): Promise<void> {
    return test.step(`update user password`, async () => {
        await navigateToUser(page, region, projectId, userId);

        const passwordSection = page.locator('form').filter({
            has: page.getByRole('heading', { name: 'Password' })
        });
        await passwordSection.locator('#newPassword').fill(newPassword);
        await passwordSection.getByRole('button', { name: 'Update' }).click();
        await expect(page.getByText(/has been updated/i)).toBeVisible();
    });
}

export async function updateUserStatus(
    page: Page,
    region: string,
    projectId: string,
    userId: string,
    enabled: boolean
): Promise<void> {
    return test.step(`update user status to: ${enabled ? 'unblocked' : 'blocked'}`, async () => {
        await navigateToUser(page, region, projectId, userId);

        const buttonText = enabled ? 'Unblock account' : 'Block account';
        const button = page.getByRole('button', { name: buttonText });
        await button.waitFor({ state: 'visible', timeout: 10000 });
        await button.click();
        await expect(page.getByText(/has been (blocked|unblocked)/i)).toBeVisible();

        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        if (!enabled) {
            await expect(page.getByText('blocked')).toBeVisible();
        } else {
            await expect(page.getByText('blocked')).not.toBeVisible();
        }
    });
}

export async function updateUserLabels(
    page: Page,
    region: string,
    projectId: string,
    userId: string,
    labels: string[]
): Promise<void> {
    return test.step(`update user labels: ${labels.join(', ')}`, async () => {
        await navigateToUser(page, region, projectId, userId);

        const labelsSection = page.locator('form').filter({
            has: page.getByRole('heading', { name: 'Labels' })
        });

        const tagsInput = labelsSection.locator('input[id="user-labels"]');
        await tagsInput.scrollIntoViewIfNeeded();

        const existingTags = labelsSection.locator('[role="button"]').filter({ hasText: /×/i });
        const count = await existingTags.count();
        for (let i = 0; i < count; i++) {
            await existingTags.first().click();
        }

        for (const label of labels) {
            await tagsInput.fill(label);
            await tagsInput.press('Enter');
        }

        const updateButton = labelsSection.getByRole('button', { name: 'Update' });
        await expect(updateButton).toBeEnabled({ timeout: 5000 });
        await updateButton.click();
        await expect(page.getByText(/have been updated/i)).toBeVisible();

        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        const reloadedLabelsSection = page.locator('form').filter({
            has: page.getByRole('heading', { name: 'Labels' })
        });
        for (const label of labels) {
            await expect(reloadedLabelsSection.getByText(label)).toBeVisible();
        }
    });
}

export async function updateUserEmailVerification(
    page: Page,
    region: string,
    projectId: string,
    userId: string,
    shouldVerify: boolean
): Promise<void> {
    return test.step(`update user email verification to: ${shouldVerify}`, async () => {
        await navigateToUser(page, region, projectId, userId);

        const verifyButton = page.getByRole('button', { name: /Verify account|Unverify account/ });
        await verifyButton.click();

        await page.locator('ul.drop-list').waitFor({ state: 'visible' });

        const dropdownItem = page
            .locator('ul.drop-list li.drop-list-item')
            .filter({ hasText: /(Verify|Unverify) email/ })
            .locator('button');
        await dropdownItem.click({ force: true });
    });
}

export async function updateUserPhoneVerification(
    page: Page,
    region: string,
    projectId: string,
    userId: string,
    shouldVerify: boolean
): Promise<void> {
    return test.step(`update user phone verification to: ${shouldVerify}`, async () => {
        await navigateToUser(page, region, projectId, userId);

        const verifyButton = page.getByRole('button', { name: /Verify account|Unverify account/ });
        await verifyButton.click();

        await page.locator('ul.drop-list').waitFor({ state: 'visible' });

        const dropdownItem = page
            .locator('ul.drop-list li.drop-list-item')
            .filter({ hasText: /(Verify|Unverify) phone/ })
            .locator('button');
        await dropdownItem.click({ force: true });
    });
}

export async function updateUserPrefs(
    page: Page,
    region: string,
    projectId: string,
    userId: string,
    prefs: UserPrefs
): Promise<void> {
    return test.step(`update user preferences`, async () => {
        await navigateToUser(page, region, projectId, userId);

        const prefsSection = page.locator('form').filter({
            has: page.getByRole('heading', { name: 'Preferences' })
        });

        const deleteButtons = prefsSection.locator('button:has(.icon-x)');

        const count = await deleteButtons.count();
        for (let i = 0; i < count; i++) {
            await deleteButtons.first().click();
        }

        const prefEntries = Object.entries(prefs);
        for (let i = 0; i < prefEntries.length; i++) {
            const [key, value] = prefEntries[i];

            const keyInput = prefsSection.locator(`id=key-${i}`);
            const valueInput = prefsSection.locator(`id=value-${i}`);

            await keyInput.fill(key);
            await valueInput.fill(value);

            if (i < prefEntries.length - 1) {
                await prefsSection.getByRole('button', { name: 'Add preference' }).click();
            }
        }

        await prefsSection.getByRole('button', { name: 'Update' }).click();
        await expect(page.getByText(/Preferences have been updated/i)).toBeVisible();

        await page.reload();
        await page.waitForLoadState('domcontentloaded');
    });
}

export async function updateUserMfa(
    page: Page,
    region: string,
    projectId: string,
    userId: string,
    enable: boolean
): Promise<void> {
    return test.step(`update user MFA to: ${enable ? 'enabled' : 'disabled'}`, async () => {
        await navigateToUser(page, region, projectId, userId);

        const mfaSection = page.locator('form').filter({
            has: page.getByRole('heading', { name: 'Multi-factor authentication' })
        });

        const mfaToggle = mfaSection.getByRole('switch');
        const isCurrentlyEnabled = (await mfaToggle.getAttribute('aria-checked')) === 'true';

        if (isCurrentlyEnabled !== enable) {
            await mfaToggle.click();
            await mfaSection.getByRole('button', { name: 'Update' }).click();
            await expect(page.getByText(/Multi-factor authentication has been/i)).toBeVisible();
        }

        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        const reloadedMfaSection = page.locator('form').filter({
            has: page.getByRole('heading', { name: 'Multi-factor authentication' })
        });
        const verifyToggle = reloadedMfaSection.getByRole('switch');
        if (enable) {
            await expect(verifyToggle).toHaveAttribute('aria-checked', 'true');
        } else {
            await expect(verifyToggle).toHaveAttribute('aria-checked', 'false');
        }
    });
}
