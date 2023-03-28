import { sdk } from '$lib/stores/sdk';
import { cachedStore } from '$lib/helpers/cache';
import type { Models } from '@appwrite.io/console';
import { writable, type Writable } from 'svelte/store';
import { isCloud } from '$lib/system';

export const usage = cachedStore<
    Models.UsageProject,
    {
        load: (projectId: string, range: string) => Promise<void>;
    }
>('projectUsage', function ({ set }) {
    return {
        load: async (projectId, range) => {
            const usages = isCloud
                ? await sdk.forProject.project.getUsage(range)
                : await sdk.forConsole.projects.getUsage(projectId, range);
            set(usages);
        }
    };
});

export const selectedTab: Writable<'platforms' | 'keys'> = writable('platforms');
