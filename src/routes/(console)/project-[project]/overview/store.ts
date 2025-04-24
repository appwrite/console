import { sdk } from '$lib/stores/sdk';
import { cachedStore } from '$lib/helpers/cache';
import { writable, type Writable } from 'svelte/store';
import type { Models, ProjectUsageRange } from '@appwrite.io/console';

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
