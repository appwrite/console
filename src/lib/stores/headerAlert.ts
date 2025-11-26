import type { Component } from 'svelte';
import { writable } from 'svelte/store';

export type HeaderAlert = {
    id: string;
    show: boolean;
    component: Component;
    importance: number;
};

export type HeaderAlertStore = {
    top: number;
    components: HeaderAlert[];
};

function createHeaderAlertStore() {
    const { set, update, subscribe } = writable<HeaderAlertStore>({
        top: 0,
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
        get: (): HeaderAlert => {
            //return highest importance component
            let component = {
                id: '',
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
            return component as HeaderAlert;
        },
        setTopSpacing: (value: number) => {
            update((n) => {
                return {
                    ...n,
                    top: value
                };
            });
        },
        getTopSpacing: (): number => {
            let top = 0;
            update((n) => {
                if (n.components.length === 0) return n;
                top = n.top;
                return n;
            });

            return top;
        }
    };
}

export const headerAlert = createHeaderAlertStore();
