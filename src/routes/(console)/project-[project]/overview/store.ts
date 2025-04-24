import { sdk } from '$lib/stores/sdk';
import { cachedStore } from '$lib/helpers/cache';
import { get, readable, writable, type Writable } from 'svelte/store';
import type { Models, ProjectUsageRange } from '@appwrite.io/console';
import type { Column } from '$lib/helpers/types';

export const usage = cachedStore<
    Models.UsageProject,
    {
        load: (start: string, end: string, period: ProjectUsageRange) => Promise<void>;
    }
>('projectUsage', function ({ set }) {
    return {
        load: async (start, end, period) => {
            const usages = await sdk.forProject.project.getUsage(start, end, period);
            set(usages);
        }
    };
});

export const selectedTab: Writable<'platforms' | 'keys' | 'dev-keys'> = writable('platforms');

export const showDevKeysCreateModal: Writable<boolean> = writable(false);

export const devKeyColumns = readable<Column[]>([
    { id: 'name', title: 'Name', type: 'string', width: { min: 120 } },
    { id: 'last_accessed', title: 'Last accessed', type: 'datetime', width: { min: 120 } },
    { id: 'expiration', title: 'Expiration date', type: 'datetime', width: { min: 120 } }
]);

export const keyColumns = readable<Column[]>([
    ...get(devKeyColumns),
    { id: 'scopes', title: 'Scopes', type: 'string', width: { min: 120 } }
]);
