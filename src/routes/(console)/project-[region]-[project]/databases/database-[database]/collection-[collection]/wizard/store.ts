import { writable } from 'svelte/store';
import type { Attributes } from '../store';

type CreateDocument = {
    id?: string;
    document: object;
    permissions: string[];
    attributes: Attributes[];
};

const initialCreateDocument: CreateDocument = {
    id: null,
    document: {},
    permissions: [],
    attributes: []
};

function createDocumentWritable() {
    const store = writable<CreateDocument>({ ...initialCreateDocument });

    const reset = () => {
        store.set({ ...initialCreateDocument });
    };

    return {
        ...store,
        reset
    };
}

export const createDocument = createDocumentWritable();
