import { page } from '$app/stores';
import type { Column } from '$lib/helpers/types';
import type { Models } from '@appwrite.io/console';
import { derived, writable } from 'svelte/store';
import { IconChartBar, IconCloudUpload, IconCog } from '@appwrite.io/pink-icons-svelte';

export type TableColumnSuggestions = {
    enabled: boolean;
    thinking: boolean;
    context?: string | null;
};

export const database = derived(page, ($page) => $page.data.database as Models.Database);
export const showCreateTable = writable(false);

export const tableColumnSuggestions = writable<TableColumnSuggestions>({
    enabled: false,
    context: null,
    thinking: false
});

export const tableViewColumns = writable<Column[]>([
    { id: '$id', title: 'Table ID', type: 'string', width: 200 },
    { id: 'name', title: 'Name', type: 'string', width: { min: 120 } },
    { id: '$createdAt', title: 'Created', type: 'datetime', width: { min: 120 } },
    { id: '$updatedAt', title: 'Updated', type: 'datetime', width: { min: 120 } }
]);

export const backupRetainingOptions = [
    { label: '3 Days', value: 3 },
    { label: '1 Week', value: 7 },
    { label: '2 Weeks', value: 14 },
    { label: '1 Month', value: 30 },
    { label: '3 Months', value: 90 },
    { label: '1 Year', value: 365 },
    { label: 'Forever', value: 365 * 100 },
    { label: 'Custom', value: -1 }
];

export const customRetainingOptions = [
    { label: 'Days', value: 1, max: 30 },
    { label: 'Weeks', value: 7, max: 4 },
    { label: 'Months', value: 30, max: 12 }
];

export const databaseSubNavigationItems = [
    { title: 'Backups', href: 'backups', icon: IconCloudUpload },
    { title: 'Usage', href: 'usage', icon: IconChartBar },
    { title: 'Settings', href: 'settings', icon: IconCog }
];
