import type { Column } from '$lib/helpers/types';
import { writable } from 'svelte/store';

export const columns = writable<Column[]>([
    { id: '$id', title: 'Log ID', type: 'string', width: { min: 200, max: 250 } },
    {
        id: 'deploymentId',
        title: 'Deployment ID',
        type: 'string',
        width: { min: 210 },
        hide: true
    },
    {
        id: 'requestPath',
        title: 'Path',
        type: 'string',
        width: { min: 480 },
        format: 'string'
    },
    {
        id: 'requestMethod',
        title: 'Method',
        type: 'string',
        array: true,
        format: 'enum',
        elements: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        width: { min: 70, max: 150 }
    },
    {
        id: 'responseStatusCode',
        title: 'Status code',
        type: 'integer',
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
        ],
        width: { min: 90, max: 150 },
        filter: false //TODO: re-enable
    },

    {
        id: 'trigger',
        title: 'Trigger',
        type: 'string',
        exclude: true,
        array: true,
        format: 'enum',
        elements: [
            { value: 'http', label: 'HTTP' },
            { value: 'schedule', label: 'Schedule' },
            { value: 'event', label: 'Event' }
        ],
        filter: false
    },

    {
        id: 'duration',
        title: 'Duration',
        width: { min: 80, max: 200 },
        type: 'integer',
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
        width: { min: 120, max: 180 },
        type: 'datetime',
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
