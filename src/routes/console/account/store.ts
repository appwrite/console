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
            const response = await sdkForConsole.account.getSessions();
            set(response);
        }
    };
});
export const accountActivity = cachedStore<
    Models.LogList,
    {
        load: (limit: number, offset: number) => Promise<void>;
    }
>('accountActivity', function ({ set }) {
    return {
        load: async (limit, offset) => {
            const response = await sdkForConsole.account.getLogs(limit, offset);
            set(response);
        }
    };
});
