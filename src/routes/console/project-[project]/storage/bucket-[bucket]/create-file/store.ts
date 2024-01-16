import { writable } from 'svelte/store';

type CreateFile = {
    files: FileList | null;
    id: string | null;
    permissions: string[];
};

const initialState: CreateFile = {
    files: null,
    id: null,
    permissions: []
};

export const createFile = (function initialize() {
    const store = writable<CreateFile>({ ...initialState });

    return {
        ...store,
        reset() {
            store.set({ ...initialState });
        }
    };
})();
