import { writable } from 'svelte/store';

export type Breadcrumb = {
    name: string;
    link?: string;
};

export const breadcrumbs = writable<Breadcrumb[]>([]);
