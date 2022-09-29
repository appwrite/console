import { cachedStore } from '$lib/helpers/cache';
import { sdkForConsole } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';

export const accountSession = cachedStore<
    Models.SessionList,
    {
        load: () => Promise<void>;
    }
>('accountSession', function ({ set }) {
    return {
        load: async () => {
            const response = await sdkForConsole.account.listSessions();
            set(response);
        }
    };
});
export const accountActivity = cachedStore<
    Models.LogList,
    {
        load: (queries: string[]) => Promise<void>;
    }
>('accountActivity', function ({ set }) {
    return {
        load: async (queries) => {
            const response = await sdkForConsole.account.listLogs(queries);
            set(response);
        }
    };
});
