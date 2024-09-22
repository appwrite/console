import { writable } from 'svelte/store';
import type { UserBackupPolicy } from '$lib/helpers/backups';

export const policyPricing = 0; //20;

export const presetPolicies = writable<UserBackupPolicy[]>([
    {
        label: 'Hourly',
        retained: 1, // 8 hours isn't a valid param because 0.33 < 1, defaulting to 24 hours for now!
        default: true,
        checked: false,
        schedule: '{time} * * *',
        selectedTime: '00:00',
        plainTextFrequency: 'hourly',
        description: 'Runs every hour and is retained for 1 day'
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
    },
    {
        label: 'Weekly',
        retained: 30,
        default: true,
        checked: false,
        schedule: '{time} * * 1',
        selectedTime: '00:00',
        plainTextFrequency: 'weekly',
        description: 'Runs every Monday and is retained for 4 weeks'
    },
    {
        label: 'Monthly',
        retained: 90,
        default: true,
        checked: false,
        schedule: '{time} 28 * *',
        selectedTime: '00:00',
        plainTextFrequency: 'monthly',
        description: 'Runs every 28th of month and is retained for 3 months'
    }
]);
