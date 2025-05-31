import type { Column } from '$lib/helpers/types';
import { writable } from 'svelte/store';

export const columns = writable<Column[]>([
    {
        id: 'domain',
        title: 'Domain',
        type: 'string',
        format: 'string',
        width: { min: 200 }
    },

    {
        id: 'target',
        title: 'Target',
        type: 'string',
        width: { min: 120, max: 400 }
    }
]);
