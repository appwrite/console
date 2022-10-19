import { writable, readable, get } from 'svelte/store';
import type { SvelteComponent } from 'svelte';

export type Tab = {
    href: string;
    title: string;
};

export type Breadcrumb = {
    href: string;
    title: string;
};

export type updateLayoutArguments = {
    header?: typeof SvelteComponent;
    breadcrumb?: typeof SvelteComponent;
};

export const header = writable<typeof SvelteComponent>();
export const breadcrumb = writable<typeof SvelteComponent>();

export function updateLayout(args: updateLayoutArguments) {
    header.set(args.header ?? null);
    breadcrumb.set(args.breadcrumb ?? null);
}

export const pageLimit = readable(12); // default page limit
export const cardLimit = readable(6); // default card limit
