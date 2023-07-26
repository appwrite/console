import type { Models } from '@appwrite.io/console';
import { writable } from 'svelte/store';

export const log = writable<{
    show: boolean;
    func: Models.Function;
    data: Models.Execution<Record<string, string>>;
}>({
    show: false,
    func: null,
    data: null
});
