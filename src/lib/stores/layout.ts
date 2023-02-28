import { writable, readable } from 'svelte/store';
import type { SvelteComponent } from 'svelte';
import { browser } from '$app/environment';

export type Tab = {
    href: string;
    title: string;
};

export type Breadcrumb = {
    href: string;
    title: string;
};

export type View = 'list' | 'grid';

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

export const preferredView = writable<View>(
    browser ? (sessionStorage.getItem('prefferedView') as View) : 'grid'
);

if (browser) {
    preferredView.subscribe((u) => sessionStorage.setItem('prefferedView', u ?? 'grid'));
}
