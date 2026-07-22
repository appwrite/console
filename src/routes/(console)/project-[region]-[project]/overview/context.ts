import { getContext, type Component } from 'svelte';
import type { Writable } from 'svelte/store';

export type OverviewActionContext = Writable<Component | null>;

export function setOverviewAction(component: Component | null) {
    getContext<OverviewActionContext>('overview-action').set(component);
}
