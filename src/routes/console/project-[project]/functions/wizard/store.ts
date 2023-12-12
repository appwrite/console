import type { Models } from '@appwrite.io/console';
import { writable } from 'svelte/store';

export const createFunction = writable<{
    id?: string;
    name: string;
    entrypoint: string;
    execute: string[];
    runtime: string;
    vars?: Partial<Models.Variable>[];
    events?: string[];
    schedule?: string;
    timeout?: number;
}>({
    id: null,
    name: null,
    entrypoint: null,
    execute: [],
    runtime: null,
    vars: [],
    events: [],
    schedule: null,
    timeout: null
});
