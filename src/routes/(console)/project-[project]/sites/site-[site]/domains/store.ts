import type { Column } from '$lib/helpers/types';
import { writable } from 'svelte/store';

export const columns = writable<Column[]>([
    {
        id: 'domain',
        title: 'Domain',
        type: 'string',
        format: 'string',
        width: { min: 120, max: 400 }
    },

    {
        id: 'redirectUrl',
        title: 'Redirect to',
        type: 'string',
        width: { min: 120, max: 200 }
    },
    {
        id: 'deploymentVcsProviderBranch',
        title: 'Production branch',
        type: 'string',
        width: { min: 70, max: 150 }
    }
]);
