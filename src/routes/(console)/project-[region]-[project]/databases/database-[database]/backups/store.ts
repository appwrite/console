import { writable } from 'svelte/store';
import type { Column } from '$lib/helpers/types';
import type { UserBackupPolicy } from '$lib/helpers/backups';

export const showCreatePolicy = writable(false);
export const showCreateBackup = writable(false);

export const presetPolicies = writable<UserBackupPolicy[]>([
    {
        label: 'Hourly',
        retained: 1,
        default: true,
        checked: false,
        schedule: '0 * * * *',
        selectedTime: '00:00',
        plainTextFrequency: 'hourly',
        description: 'Runs every hour and is retained for 24 hours'
    },
    {
        label: 'Daily',
        retained: 7,
        default: true,
        checked: false,
        schedule: '{time} * * *',
        selectedTime: '00:00',
        plainTextFrequency: 'daily',
        description: 'Runs every day and is retained for 7 days'
    }
]);

export const columns = writable<Column[]>([
    { id: 'backups', title: 'Backups', type: 'string', width: { min: 180 } },
    { id: 'size', title: 'Size', type: 'integer', width: { min: 163 } },
    { id: 'status', title: 'Status', type: 'enum', width: { min: 163 } },
    { id: 'policy', title: 'Policy', type: 'string', width: { min: 163 } },
    { id: 'actions', title: '', type: 'string', width: 48 }
]);
