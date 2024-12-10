import { sdk } from '$lib/stores/sdk';
import { cachedStore } from '$lib/helpers/cache';
import { get, writable, type Writable } from 'svelte/store';
import type { Models, ProjectUsageRange } from '@appwrite.io/console';
import { page } from '$app/stores';

export const usage = cachedStore<
    Models.UsageProject,
    {
        load: (start: string, end: string, period: ProjectUsageRange) => Promise<void>;
    }
>('projectUsage', function ({ set }) {
    return {
        load: async (start, end, period) => {
            const $page = get(page);
            const usages = await sdk
                .forProject($page.params.region, $page.params.project)
                .project.getUsage(start, end, period);
            set(usages);
        }
    };
});

export const selectedTab: Writable<'platforms' | 'keys'> = writable('platforms');
