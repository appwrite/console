import { writable } from 'svelte/store';

type CreateDatabase = {
    id: string;
    name: string;
};

export const createDatabaseStore = writable<CreateDatabase>({
    id: '',
    name: ''
});
