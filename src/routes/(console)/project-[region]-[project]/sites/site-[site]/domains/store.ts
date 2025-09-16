import type { Column } from '$lib/helpers/types';
import { writable } from 'svelte/store';

export const columns = writable<Column[]>([
    {
        id: 'domain',
        title: 'Domain',
        type: 'string',
        format: 'string',
        width: { min: 300 }
    },

    {
        id: 'target',
        title: 'Target',
        type: 'string',
        width: { min: 120, max: 400 }
    },

    {
        id: 'updated',
        title: '',
        type: 'string',
        width: { min: 160, max: 180 }
    }
]);
