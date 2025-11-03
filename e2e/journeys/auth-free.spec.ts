import { test, expect } from '../fixtures/base';
import {
    createUser,
    searchUser,
    clearUserSearch,
    updateUserName,
    updateUserEmail,
    updateUserPhone,
    updateUserPassword,
    updateUserStatus,
    updateUserLabels,
    updateUserEmailVerification,
    updateUserPhoneVerification,
    updateUserPrefs,
    updateUserMfa,
    deleteUser
} from '../auth/users';
import { navigateToUsers } from '../auth/navigation';

test('auth flow - free tier', async ({ page, project }) => {
    const user = await createUser(page, project.region, project.id, {
        name: 'Test User',
        email: 'testuser@example.com',
        phone: '+12345678901',
        password: 'password123'
    });

    await test.step('verify user appears in list', async () => {
        await navigateToUsers(page, project.region, project.id);
        await expect(page.getByText('Test User')).toBeVisible();
        await expect(page.getByText('testuser@example.com')).toBeVisible();
    });

    const user2 = await createUser(page, project.region, project.id, {
        name: 'Second User',
        email: 'second@second.com',
        password: 'password456'
    });

    const user3 = await createUser(page, project.region, project.id, {
        name: 'Third User',
        email: 'third@example.com',
        phone: '+13334445555',
        password: 'password789'
    });

    await updateUserName(page, project.region, project.id, user.id, 'Updated Test User');
    await updateUserEmail(page, project.region, project.id, user.id, 'updated@example.com');
    await updateUserPhone(page, project.region, project.id, user.id, '+19876543210');
    await updateUserPassword(page, project.region, project.id, user.id, 'newpassword123');

    await updateUserStatus(page, project.region, project.id, user.id, false);
    await test.step('verify blocked status', async () => {
        await navigateToUsers(page, project.region, project.id);
        const userRow = page.locator('[role="row"]').filter({ hasText: 'Updated Test User' });
        await expect(userRow.getByText('blocked')).toBeVisible({  timeout: 15000 });
    });

    await updateUserStatus(page, project.region, project.id, user.id, true);
    await test.step('verify unblocked status', async () => {
        await navigateToUsers(page, project.region, project.id);
        const userRow = page.locator('[role="row"]').filter({ hasText: 'Updated Test User' });
        await expect(userRow.getByText('blocked')).not.toBeVisible({  timeout: 15000 });
    });

    await updateUserLabels(page, project.region, project.id, user.id, ['test', 'e2e', 'freeTier']);

    await test.step('search by name', async () => {
        await navigateToUsers(page, project.region, project.id);
        await searchUser(page, 'Updated');
        await expect(page.getByText('Updated Test User')).toBeVisible();
        await expect(page.getByText('Second User')).not.toBeVisible();
        await expect(page.getByText('Third User')).not.toBeVisible();
    });

    await test.step('search by email', async () => {
        await navigateToUsers(page, project.region, project.id);
        await searchUser(page, 'updated@example.com');
        await expect(page.getByText('updated@example.com')).toBeVisible();
        await expect(page.getByText('second@second.com')).not.toBeVisible();
    });

    await test.step('verify multiple users', async () => {
        await clearUserSearch(page);
        await navigateToUsers(page, project.region, project.id);

        const updatedRow = page.locator('[role="row"]').filter({ hasText: 'Updated Test User' });
        const secondRow = page.locator('[role="row"]').filter({ hasText: 'Second User' });
        const thirdRow = page.locator('[role="row"]').filter({ hasText: 'Third User' });

        await expect(updatedRow).toBeVisible({ timeout: 5000 });
        await expect(secondRow).toBeVisible({ timeout: 5000 });
        await expect(thirdRow).toBeVisible({ timeout: 5000 });
    });

    await test.step('test email and phone verification', async () => {
        const userRow = page.locator('[role="row"]').filter({ hasText: 'Updated Test User' });
        await expect(userRow.getByText('unverified')).toBeVisible();

        await updateUserEmailVerification(page, project.region, project.id, user.id, true);
        await navigateToUsers(page, project.region, project.id);
        await expect(userRow.getByText('verified email')).toBeVisible();

        await updateUserPhoneVerification(page, project.region, project.id, user.id, true);
        await navigateToUsers(page, project.region, project.id);
        await expect(userRow.getByText('verified')).toBeVisible();

        await updateUserPhoneVerification(page, project.region, project.id, user.id, false);
        await navigateToUsers(page, project.region, project.id);
        await expect(userRow.getByText('verified email')).toBeVisible();
    });

    await test.step('test user preferences', async () => {
        await updateUserPrefs(page, project.region, project.id, user.id, {
            theme: 'dark',
            language: 'en',
            timezone: 'UTC'
        });
    });

    await test.step('test MFA toggle', async () => {
        await updateUserMfa(page, project.region, project.id, user.id, true);
        await updateUserMfa(page, project.region, project.id, user.id, false);
    });

    await deleteUser(page, project.region, project.id, user.id);
    await deleteUser(page, project.region, project.id, user2.id);
    await deleteUser(page, project.region, project.id, user3.id);

    await test.step('verify users deleted', async () => {
        await navigateToUsers(page, project.region, project.id);
        await expect(page.getByText('Updated Test User')).not.toBeVisible();
        await expect(page.getByText('Second User')).not.toBeVisible();
        await expect(page.getByText('Third User')).not.toBeVisible();
    });
});
