import { writable } from 'svelte/store';
import type { Component } from 'svelte';

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
    header?: Component;
    breadcrumb?: Component;
};

export const header = writable<Component>();
export const breadcrumb = writable<Component>();

export function updateLayout(args: updateLayoutArguments) {
    header.set(args.header ?? null);
    breadcrumb.set(args.breadcrumb ?? null);
}

export const showSubNavigation = writable(false);
