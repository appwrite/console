import { sdkForProject } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';

export const user = cachedStore<
    Models.User<Record<string, unknown>>,
    {
        load: (userId: string) => Promise<void>;
    }
>('selectedUser', function ({ set }) {
    return {
        load: async (userId: string) => {
            const response = await sdkForProject.users.get(userId);
            set(response);
        }
    };
});
