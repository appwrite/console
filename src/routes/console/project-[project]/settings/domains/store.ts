import { sdkForConsole } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';

export const domainList = cachedStore<
    Models.DomainList,
    {
        load: (projectId: string) => Promise<void>;
    }
>('domainList', function ({ set }) {
    return {
        load: async (projectId) => {
            const response = await sdkForConsole.projects.listDomains(projectId);
            set(response);
        }
    };
});
