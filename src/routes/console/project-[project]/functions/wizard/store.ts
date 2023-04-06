import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';

export const createFunction = writable<{
    id?: string;
    name: string;
    execute: string[];
    runtime: string;
    vars?: Partial<Models.Variable>[];
    events?: string[];
    schedule?: string;
    timeout?: number;
}>({
    id: null,
    name: null,
    execute: [],
    runtime: null,
    vars: [],
    events: [],
    schedule: null,
    timeout: null
});
