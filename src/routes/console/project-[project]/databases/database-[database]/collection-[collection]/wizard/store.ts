import { writable } from 'svelte/store';
import type { Attributes } from '../store';

type Store = {
    id?: string | null;
    // TODO: Improve this type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    document: Record<string, any>;
    permissions: string[];
    attributes: Attributes[];
};

export const createDocument = writable<Store>({
    id: null,
    document: {},
    permissions: [],
    attributes: []
});
