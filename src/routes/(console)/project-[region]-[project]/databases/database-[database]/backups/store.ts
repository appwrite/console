import { writable } from 'svelte/store';
import type { UserBackupPolicy } from '$lib/helpers/backups';

export const policyPricing = 20; //TODO: get this from the backend
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
