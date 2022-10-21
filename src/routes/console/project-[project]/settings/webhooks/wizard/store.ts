import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';

export const createWebhook = writable<Partial<Models.Webhook>>({
    name: null,
    url: null,
    events: [],
    security: false,
    httpUser: null,
    httpPass: null
});
