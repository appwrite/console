import { page } from '$app/stores';
import type { Models } from '@appwrite.io/console';
import { derived } from 'svelte/store';

export const specificationsList = derived(
    page,
    ($page) => $page.data.specificationsList as Models.SpecificationList
);
