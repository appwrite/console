import type { Column } from '$lib/helpers/types';
import { writable } from 'svelte/store';

export const columns = writable<Column[]>([
    {
        id: 'domain',
        title: 'Domain',
        type: 'string',
        format: 'string',
        width: { min: 200, max: 600 }
    },

    {
        id: 'redirectUrl',
        title: 'Redirect to',
        type: 'string',
        width: { min: 120, max: 300 }
    },
    {
        id: 'deploymentVcsProviderBranch',
        title: 'Production branch',
        type: 'string',
        width: { min: 90, max: 150 }
    }
]);
