import type { SvelteComponent } from 'svelte';
import { writable } from 'svelte/store';

export type HeaderAlert = {
    show: boolean;
    component: typeof SvelteComponent<unknown>;
    importance: number;
};

export type HeaderAlertStore = {
    components: HeaderAlert[];
};

function createHeaderAlertStore() {
    const { subscribe, update, set } = writable<HeaderAlertStore>({
        components: []
    });

    return {
        subscribe,
        set,
        add: (component: HeaderAlert) => {
            update((n) => {
                n.components.push(component);
                n.components = n.components;
                return n;
            });
        },
        get: (): HeaderAlert => {
            //return higest importance component
            let component = {
                show: false,
                component: null,
                importance: 0
            };
            update((n) => {
                n.components.forEach((c) => {
                    if (c.importance > component.importance) {
                        component = c;
                    }
                });
                return n;
            });
            return component;
        }
    };
}

export const headerAlert = createHeaderAlertStore();
