import { sdk } from '$lib/stores/sdk';
import { cachedStore } from '$lib/helpers/cache';
import type { UsageProject } from '$lib/sdk/usage';
import { writable, type Writable } from 'svelte/store';

export const usage = cachedStore<
    UsageProject,
    {
        load: (range: string) => Promise<void>;
    }
>('projectUsage', function ({ set }) {
    return {
        load: async (range) => {
            const usages: UsageProject = (await sdk.forProject.project.getUsage(range)) as unknown as UsageProject;
            set(usages);
        }
    };
});

export const selectedTab: Writable<'platforms' | 'keys'> = writable('platforms');
