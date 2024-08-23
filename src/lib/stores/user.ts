import { page } from '$app/stores';
import { derived } from 'svelte/store';
import type { Models } from '@appwrite.io/console';
import { browser } from '$app/environment';

export type Account = Models.User<{ organization?: string } & Record<string, string>>;

export const user = derived(page, ($page) => {
    if (browser) sessionStorage.setItem('account', JSON.stringify($page.data.account));
    return $page.data.account as Account;
});
