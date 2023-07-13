import { writable } from 'svelte/store';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const randRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

type Status = 'idle' | 'running' | 'error' | 'success';

type State = {
    items: {
        databases?: Status;
        documents?: Status;
        users?: Status;
        storage?: Status;
    };
    status: Status;
};

function createMigrator() {
    const { subscribe, update, set } = writable<State>({
        items: { databases: 'idle', documents: 'running', users: 'error', storage: 'success' },
        status: 'running'
    });

    const startMigration = async () => {
        set({
            items: {
                databases: 'idle',
                documents: 'idle',
                users: 'idle',
                storage: 'idle'
            },
            status: 'running'
        });

        const keys = ['databases', 'documents', 'users', 'storage'];

        for (const key of keys) {
            sleep(randRange(1000, 5000)).then(() => {
                update((state) => ({
                    ...state,
                    items: { ...state.items, [key]: 'running' }
                }));

                sleep(randRange(1000, 5000)).then(() => {
                    update((state) => ({
                        ...state,
                        items: { ...state.items, [key]: 'success' }
                    }));
                });
            });
        }
    };

    return {
        subscribe,
        startMigration
    };
}

export const migrator = createMigrator();
