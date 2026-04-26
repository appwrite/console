import type { Component } from 'svelte';
import { writable } from 'svelte/store';

export type HeaderAlert = {
    id: string;
    show: boolean;
    component: Component;
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
                if (n.components.some((c) => c.id === component.id)) return n;
                else {
                    n.components.push(component);
                    n.components = [...n.components];
                    return n;
                }
            });
        },
        updateShow: (id: string, show: boolean) => {
            update((n) => {
                const component = n.components.find((c) => c.id === id);
                if (!component || component.show === show) return n;

                component.show = show;
                n.components = [...n.components];
                return n;
            });
        },
        get: (): HeaderAlert => {
            // return highest importance visible component
            let component = {
                id: '',
                show: false,
                component: null,
                importance: 0
            };
            update((n) => {
                n.components.forEach((c) => {
                    if (c.show && c.importance > component.importance) {
                        component = c;
                    }
                });
                return n;
            });
            return component as HeaderAlert;
        }
    };
}

export const headerAlert = createHeaderAlertStore();
