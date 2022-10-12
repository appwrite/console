import type { SvelteComponent } from 'svelte';
import { writable } from 'svelte/store';

export type WizardStore = {
    show: boolean;
    component?: typeof SvelteComponent;
    interceptor?: () => void;
};

function createWizardStore() {
    const { subscribe, update } = writable<WizardStore>({
        show: false,
        component: null,
        interceptor: null
    });

    return {
        subscribe,
        start: (component: typeof SvelteComponent) =>
            update((n) => {
                n.show = true;
                n.component = component;

                return n;
            }),
        setInterceptor: (callback: () => void) => {
            update((n) => {
                n.interceptor = callback;

                return n;
            });
        },
        hide: () =>
            update((n) => {
                n.show = false;
                n.component = null;

                return n;
            })
    };
}

export const wizard = createWizardStore();
