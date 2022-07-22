import { project } from '../../routes/console/[project]/store';
import { get, writable } from 'svelte/store';

export type Tab = {
    href: string;
    title: string;
};

export const title = writable<string>('');
export const backButton = writable<string>('');
export const copyData = writable({
    text: '',
    value: ''
});
export const tabs = writable<Tab[]>([]);

export function updateLayout(args: {
    title: string;
    tabs?: Tab[];
    back?: string;
    copy?: {
        text: string;
        value: string;
    };
    navigate?: {
        from: URL | null;
        to: URL;
    };
}) {
    const projectId = get(project)?.$id;
    const base = projectId ? `/console/${projectId}` : `/console`;

    if (args?.navigate?.to) {
        const oldTabs = get(tabs);
        if (oldTabs.some((t) => `${base}/${t.href}` === args.navigate.to.pathname)) {
            return;
        }
    }

    title.set(args.title);
    backButton.set(args.back ?? null);
    copyData.set(args.copy ?? null);
    tabs.set(args.tabs ?? []);
}
