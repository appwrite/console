import { writable, type Writable } from 'svelte/store';
import type { Column } from '$lib/helpers/types';

export const showCreateDeployment: Writable<boolean> = writable(false);

export const columns = writable<Column[]>([
    { id: '$id', title: 'Deployment ID', type: 'string', width: { min: 200, max: 250 } },
    {
        id: 'status',
        title: 'Status',
        type: 'enum',
        width: { min: 90, max: 130 },
        array: true,
        format: 'enum',
        elements: ['ready', 'processing', 'building', 'waiting', 'cancelled', 'failed']
    },

    {
        id: 'buildDuration',
        title: 'Build duration',
        type: 'integer',
        width: { min: 110, max: 190 },

        elements: [
            {
                value: 15,
                label: 'more than 15 seconds'
            },
            {
                value: 60,
                label: 'more than 1 minute'
            },
            {
                value: 5 * 60,
                label: 'more than 5 minutes'
            }
        ],
        filter: false
    },
    {
        id: 'totalSize',
        title: 'Total size',
        type: 'integer',
        width: { min: 110, max: 190 },
        elements: [
            {
                value: 2 * 1000 * 1000,
                label: 'more than 2MB'
            },
            {
                value: 10 * 1000 * 1000,
                label: 'more than 10MB'
            },
            {
                value: 50 * 1000 * 1000,
                label: 'more than 50MB'
            }
        ]
    },
    {
        id: 'sourceSize',
        title: 'Source size',
        type: 'integer',
        show: false,
        width: { min: 110, max: 190 },
        elements: [
            {
                value: 2 * 1000 * 1000,
                label: 'more than 2MB'
            },
            {
                value: 10 * 1000 * 1000,
                label: 'more than 10MB'
            },
            {
                value: 50 * 1000 * 1000,
                label: 'more than 50MB'
            }
        ]
    },
    {
        id: 'buildSize',
        title: 'Build size',
        type: 'integer',
        show: false,
        filter: false,
        width: { min: 90, max: 190 }
    },
    {
        id: 'type',
        title: 'Source',
        type: 'string',
        width: { min: 90, max: 160 },
        array: true,
        format: 'enum',
        elements: [
            { value: 'manual', label: 'Manual' },
            { value: 'cli', label: 'CLI' },
            { value: 'vcs', label: 'Git' }
        ]
    },
    {
        id: '$updatedAt',
        title: 'Updated',
        type: 'datetime',
        width: { min: 150, max: 180 },

        format: 'datetime'
    }
]);
