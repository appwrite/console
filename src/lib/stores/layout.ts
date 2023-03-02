import { writable } from 'svelte/store';
import type { SvelteComponent } from 'svelte';
import { browser } from '$app/environment';
import { PAGE_LIMIT } from '$lib/constants';

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

export const customPageLimit = writable<number>(
    browser
        ? sessionStorage.getItem('customPageLimit')?.length
            ? parseInt(sessionStorage.getItem('customPageLimit'))
            : PAGE_LIMIT
        : PAGE_LIMIT
);

if (browser) {
    customPageLimit.subscribe((u) =>
        sessionStorage.setItem('customPageLimit', u.toString() ?? PAGE_LIMIT.toString())
    );
}
