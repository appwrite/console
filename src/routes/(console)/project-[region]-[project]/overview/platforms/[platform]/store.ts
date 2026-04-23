import { derived } from 'svelte/store';
import { page } from '$app/stores';
import type { AnyPlatform } from '$lib/helpers/platform';

export const platform = derived(page, ($page) => $page.data.platform as AnyPlatform);
