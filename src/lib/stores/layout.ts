import { project } from '../../routes/console/[project]/store';
import { get, writable, readable } from 'svelte/store';
import type { Models } from '@aw-labs/appwrite-console';

export type Tab = {
    href: string;
    title: string;
};

export type Breadcrumb = {
    href: string;
    title: string;
    level?: number;
};

export type updateLayoutArguments = {
    title: string;
    titleDropdown?: Models.Team[];
    level?: number;
    tabs?: Tab[];
    back?: string;
    breadcrumbs?: Breadcrumb[] | Breadcrumb;
    copy?: {
        text: string;
        value: string;
    };
    customBase?: string;
    navigate?: {
        from: URL | null;
        to: URL;
    };
};

export const level = writable<number>();
export const title = writable<string>('');
export const titleDropdown = writable<Models.Team[]>([]);
export const backButton = writable<string>('');
export const tabs = writable<Tab[]>([]);
export const breadcrumbs = writable<Map<number, Breadcrumb>>(new Map());
export const copyData = writable({
    text: '',
    value: ''
});

export function updateLayout(args: updateLayoutArguments) {
    const projectId = get(project)?.$id;
    const base = args?.customBase ?? projectId ? `/console/${projectId}` : ``;

    if (args?.tabs) {
        args.tabs.map((tab) => {
            tab.href = `${base}/${tab.href}`;
        });
    }

    if (args?.navigate?.to) {
        const previousTabs = get(tabs);
        if (previousTabs.some((t) => `${base}/${t.href}` === args.navigate.to.pathname)) {
            return;
        }
    }

    title.set(args.title);
    titleDropdown.set(args.titleDropdown ?? []);
    backButton.set(args.back ?? null);
    copyData.set(args.copy ?? null);
    level.set(args.level ?? null);
    tabs.set(args.tabs ?? []);

    if (args.breadcrumbs) {
        if (!Array.isArray(args.breadcrumbs)) {
            args.breadcrumbs = [args.breadcrumbs];
        }
        for (const breadcrumb of args.breadcrumbs) {
            breadcrumbs.update((n) => n.set(breadcrumb.level ?? args.level, breadcrumb));
        }
    }
}

export const pageLimit = readable(12); // default page limit
