import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';

export const createPlatform = writable<Partial<Models.Platform>>({
    name: null,
    hostname: null,
    type: null
});
