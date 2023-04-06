import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';

export const log = writable<{
    show: boolean;
    func: Models.Function;
    data: Models.Execution | Models.Deployment;
}>({
    show: false,
    func: null,
    data: null
});
