import { writable } from 'svelte/store';

export type VariablesOperationItem = {
    id: string;
    count: number;
    mode: 'import' | 'delete';
    status: 'uploading' | 'deleting' | 'completed' | 'failed';
    error?: string;
};

function createVariablesOperation() {
    const { subscribe, update, set } = writable<VariablesOperationItem[]>([]);

    return {
        subscribe,
        set: (item: VariablesOperationItem) =>
            update((items) => {
                const index = items.findIndex((current) => current.id === item.id);

                if (index !== -1) {
                    const next = [...items];
                    next[index] = item;
                    return next;
                }

                return [item, ...items];
            }),
        clear: (id?: string) =>
            update((items) => {
                if (!id) {
                    return [];
                }

                return items.filter((item) => item.id !== id);
            }),
        reset: () => set([])
    };
}

export const variablesOperation = createVariablesOperation();
