import { writable } from 'svelte/store';

export type SupportData = {
    message: string;
    tags: string[];
    file?: File | null;
};

export const supportData = writable<SupportData>({
    message: '',
    tags: ['general'],
    file: null
});
