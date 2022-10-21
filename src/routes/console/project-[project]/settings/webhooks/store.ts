import { sdkForConsole } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';

export const webhookList = cachedStore<
    Models.WebhookList,
    {
        load: (projectId: string) => Promise<void>;
    }
>('webhookList', function ({ set }) {
    return {
        load: async (projectId) => {
            const response = await sdkForConsole.projects.listWebhooks(projectId);
            set(response);
        }
    };
});
