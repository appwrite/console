import type { Column } from '$lib/helpers/types';
import { writable } from 'svelte/store';

export const columns = writable<Column[]>([
    { id: '$id', title: 'Execution ID', type: 'string', width: 150 },
    {
        id: 'requestPath',
        title: 'Path',
        type: 'string',
        width: 90,
        format: 'string'
    },

    {
        id: 'trigger',
        title: 'Trigger',
        type: 'string',
        hide: true,
        width: 90,
        array: true,
        format: 'enum',
        elements: [
            { value: 'http', label: 'HTTP' },
            { value: 'schedule', label: 'Schedule' },
            { value: 'event', label: 'Event' }
        ]
    },
    {
        id: 'requestMethod',
        title: 'Method',
        type: 'string',
        hide: true,
        width: 70,
        array: true,
        format: 'enum',
        elements: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    },
    {
        id: 'responseStatusCode',
        title: 'Status code',
        type: 'integer',
        hide: true,
        width: 100,
        format: 'integer',
        elements: [
            {
                value: 299,
                label: 'Success (200-299)'
            },
            {
                value: 399,
                label: 'Redirect (300-399)'
            },
            {
                value: 499,
                label: 'Client error (400-499)'
            },
            {
                value: 599,
                label: 'Server error (500-599)'
            }
        ]
    },

    {
        id: 'status',
        title: 'Status',
        type: 'enum',
        width: 130,
        array: true,
        format: 'enum',
        elements: ['completed', 'failed', 'waiting', 'scheduled', 'processing', 'cancelled']
    },
    {
        id: 'duration',
        title: 'Duration',
        type: 'integer',
        width: 80,
        format: 'integer',
        elements: [
            {
                value: 1,
                label: 'more than 1 second'
            },
            {
                value: 5,
                label: 'more than 5 seconds'
            },
            {
                value: 30,
                label: 'more than 30 seconds'
            }
        ]
    },
    {
        id: '$createdAt',
        title: 'Created',
        type: 'datetime',
        width: 120,
        format: 'datetime',
        elements: [
            {
                value: 5 * 60 * 1000,
                label: 'last 5 minutes'
            },
            {
                value: 60 * 60 * 1000,
                label: 'last 1 hour'
            },
            {
                value: 24 * 60 * 60 * 1000,
                label: 'last 24 hours'
            }
        ]
    }
]);

export function logStatusConverter(status: string) {
    // ['completed', 'failed', 'waiting', 'scheduled', 'processing', 'cancelled']

    switch (status) {
        case 'completed':
            return 'complete';
        case 'scheduled':
            return 'processing';
        case 'processing':
            return 'processing';
        case 'waiting':
            return 'waiting';
        case 'queued':
            return 'waiting';
        case 'peding':
            return 'pending';
        case 'cancelled':
            return 'waiting';
        case 'failed':
            return 'failed';
    }
}
