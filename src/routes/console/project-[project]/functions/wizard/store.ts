import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';

type CreateFunctionStore = {
    id?: string | null;
    name: string | null;
    execute: string[];
    runtime: string | null;
    vars?: Partial<Models.Variable>[];
    events?: string[];
    schedule?: string | null;
    timeout?: number | null;
};

const initialState: CreateFunctionStore = {
    id: null,
    name: null,
    execute: [],
    runtime: null,
    vars: [],
    events: [],
    schedule: null,
    timeout: null
};

function createStore() {
    const store = writable<CreateFunctionStore>({ ...initialState });

    return {
        ...store,
        reset: () => store.set({ ...initialState })
    };
}

export const createFunction = createStore();
