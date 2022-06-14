import { writable } from 'svelte/store';

export type Tab = {
    href: string;
    title: string;
};

export const title = writable<string>('');
export const backButton = writable<string>('');
export const tabs = writable<Tab[]>([]);
