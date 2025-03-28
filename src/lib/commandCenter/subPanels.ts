import type { Component } from 'svelte';
import { writable } from 'svelte/store';

export type SubPanel = {
    name: string;
    component: Component;
};

type CastSubPanel = Omit<SubPanel, 'component'> & {
    component: unknown;
};

export const subPanels = writable<Array<SubPanel>>([]);

export function addSubPanel(subPanel: CastSubPanel) {
    subPanels.update((curr) => {
        curr.push(subPanel as SubPanel);
        return curr;
    });
}

export function popSubPanel() {
    subPanels.update((curr) => {
        curr = curr.slice(0, -1);
        return curr;
    });
}

export function clearSubPanels() {
    subPanels.set([]);
}
