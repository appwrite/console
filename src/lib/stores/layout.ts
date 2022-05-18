import { writable } from 'svelte/store';

export type Breadcrumb = {
    name: string;
    link?: string;
};

export const breadcrumbs = writable<Breadcrumb[]>([]);
export const title = writable<string>('');
export const tabs = writable<
    {
        href: string;
        title: string;
    }[]
>([]);
