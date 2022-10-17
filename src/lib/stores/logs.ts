import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';

export const log = writable<{ show: boolean; deployment: Models.Deployment }>({
    show: false,
    deployment: null
});
