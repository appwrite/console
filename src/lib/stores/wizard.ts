import type { SvelteComponent } from 'svelte';
import { writable } from 'svelte/store';

export type WizardStore = {
    show: boolean;
    media?: string;
    component?: typeof SvelteComponent;
    interceptor?: () => Promise<void>;
    nextDisabled?: boolean;
};

const initialState: WizardStore = {
    show: false,
    component: null,
    interceptor: null,
    media: null,
    nextDisabled: false
};

function createWizardStore() {
    const { subscribe, update, set } = writable<WizardStore>({ ...initialState });

    return {
        subscribe,
        set,
        start: (component: typeof SvelteComponent, media: string = null) =>
            update((n) => {
                n.show = true;
                n.component = component;
                n.media = media;
                n.nextDisabled = false;

                return n;
            }),
        setInterceptor: (callback: WizardStore['interceptor']) => {
            update((n) => {
                n.interceptor = callback;

                return n;
            });
        },
        hide: () => set({ ...initialState })
    };
}

export const wizard = createWizardStore();
