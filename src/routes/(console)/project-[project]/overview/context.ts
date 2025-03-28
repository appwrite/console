import { getContext, type Component } from 'svelte';
import type { Writable } from 'svelte/store';

export type OverviewActionContext = Writable<Component>;

export function setOverviewAction(component: Component) {
    getContext<OverviewActionContext>('overview-action').set(component);
}
