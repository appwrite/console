import { writable } from 'svelte/store';
import type { Column } from '$lib/helpers/types';
import { IconChartBar, IconCloudUpload, IconCog } from '@appwrite.io/pink-icons-svelte';
import { resolveRoute, withPath } from '$lib/stores/navigation';
import type { Page } from '@sveltejs/kit';

export const showCreateEntity = writable(false);

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

export function buildEntityRoute(page: Page, entityType: string, entityId: string): string {
    return withPath(
        resolveRoute(
            '/(console)/project-[region]-[project]/databases/database-[database]',
            page.params
        ),
        `/${entityType}-${entityId}`
    );
}
