import { writable } from 'svelte/store';
import type { Models } from '@aw-labs/appwrite-console';

export const createPlatform = writable<Partial<Models.Platform>>({
    name: null,
    hostname: null,
    type: null
});
