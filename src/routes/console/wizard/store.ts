import { writable } from 'svelte/store';

export type SupportData = {
    message: string;
    category: string;
    file?: File | null;
};

export const supportData = writable<SupportData>({
    message: '',
    category: 'general',
    file: null
});
