import { sdkForConsole } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { cachedStore } from '$lib/helpers/cache';

export const webhook = cachedStore<
    Models.Webhook,
    {
        load: (projectId: string, webhookId: string) => Promise<void>;
    }
>('webhook', function ({ set }) {
    return {
        load: async (projectId, webhookId) => {
            const response = await sdkForConsole.projects.getWebhook(projectId, webhookId);
            set(response);
        }
    };
});
