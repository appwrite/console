import { sdk } from '$lib/stores/sdk';
import { cachedStore } from '$lib/helpers/cache';
import type { Models } from '@appwrite.io/console';
import { writable, type Writable } from 'svelte/store';

export const usage = cachedStore<
    Models.UsageProject,
    {
        load: (projectId: string, range: string) => Promise<void>;
    }
>('projectUsage', function ({ set }) {
    return {
        load: async (projectId, range) => {
            const usages = await sdk.forProject.project.getUsage(range);
            set(usages);
        }
    };
});

export const selectedTab: Writable<'platforms' | 'keys'> = writable('platforms');
