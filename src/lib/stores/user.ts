import { page } from '$app/stores';
import { derived } from 'svelte/store';
import type { Models } from '@appwrite.io/console';
import { browser } from '$app/environment';
import type { NotificationPrefItem } from '$lib/helpers/notifications';

export type Account = Models.User<
    {
        organization?: string;
        console: Models.Preferences;
        notificationPrefs: Record<string, NotificationPrefItem>;
    } & Record<string, string>
>;

export const user = derived(page, ($page) => {
    if ($page.data?.account) {
        if (browser) {
            sessionStorage.setItem('account', JSON.stringify($page.data.account));
        }
        return $page.data.account as Account;
    } else return null;
});
