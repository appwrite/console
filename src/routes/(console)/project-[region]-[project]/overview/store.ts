import { sdk } from '$lib/stores/sdk';
import { cachedStore } from '$lib/helpers/cache';
import { get, readable, writable, type Writable } from 'svelte/store';
import type { Models, ProjectUsageRange } from '@appwrite.io/console';
import { page } from '$app/state';
import type { Column } from '$lib/helpers/types';
import { hash } from '$lib/helpers/string';
import { sleep } from '$lib/helpers/promises';
import { isDev } from '$lib/system';

export const loadingProjectUsage = writable(true);

export const usage = cachedStore<
    Models.UsageProject,
    {
        load: (start: string, end: string, period: ProjectUsageRange) => Promise<void>;
    }
>('projectUsage', function ({ set }) {
    const minTime = 1250;
    let lastParamsHash: string | null = null;

    return {
        load: async (start, end, period) => {
            const currentData = get(usage);
            const currentParamsHash = hash([
                page.params.project,
                page.params.region,
                start,
                end,
                period.toString()
            ]);

            // don't hit the API call if we have the data!
            if (lastParamsHash === currentParamsHash && currentData && !isDev) {
                loadingProjectUsage.set(false);
                return;
            }

            const initTime = Date.now();
            loadingProjectUsage.set(true);

            const usages = await sdk
                .forProject(page.params.region, page.params.project)
                .project.getUsage({
                    startDate: start,
                    endDate: end,
                    period
                });

            const elapsed = Date.now() - initTime;
            const remainingTime = minTime - elapsed;

            if (remainingTime >= 0) {
                await sleep(remainingTime);
            }

            set(usages);
            lastParamsHash = currentParamsHash;
            loadingProjectUsage.set(false);
        }
    };
});

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
