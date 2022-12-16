import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';

export const createWebhook = writable<Partial<Models.Webhook>>({
    name: undefined,
    url: undefined,
    events: [],
    security: false,
    httpUser: undefined,
    httpPass: undefined
});
