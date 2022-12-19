import { writable } from 'svelte/store';

type Store = {
    id?: string;
    files: FileList | null;
    permissions?: string[];
};

const initialState: Store = {
    files: null
};

function createStore() {
    const store = writable<Store>({ ...initialState });

    return { ...store, reset: () => store.set({ ...initialState }) };
}

export const store = createStore();
