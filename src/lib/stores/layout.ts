import { writable } from 'svelte/store';
import type { SvelteComponent } from 'svelte';

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
    header?: typeof SvelteComponent<unknown>;
    breadcrumb?: typeof SvelteComponent<unknown>;
};

export const header = writable<typeof SvelteComponent<unknown>>();
export const breadcrumb = writable<typeof SvelteComponent<unknown>>();

export function updateLayout(args: updateLayoutArguments) {
    header.set(args.header ?? null);
    breadcrumb.set(args.breadcrumb ?? null);
}

export const showSubNavigation = writable(false);
