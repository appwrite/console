import { getContext, type SvelteComponent } from 'svelte';
import type { Writable } from 'svelte/store';

export type OverviewActionContext = Writable<typeof SvelteComponent<unknown>>;

export function setOverviewAction(component: typeof SvelteComponent<unknown>) {
    getContext<OverviewActionContext>('overview-action').set(component);
}
