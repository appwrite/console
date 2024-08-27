import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import { derived } from 'svelte/store';

export const template = derived(page, ($page) => $page.data.template as Models.TemplateFunction);
