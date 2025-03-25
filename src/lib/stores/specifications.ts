import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import { derived } from 'svelte/store';

export const specificationsList = derived(
    page,
    async ($page) => (await $page.data.specificationsList) as Models.SpecificationList
);
