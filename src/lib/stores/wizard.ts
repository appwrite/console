import { trackEvent } from '$lib/actions/analytics';
import type { ComponentType } from 'svelte';
import { writable } from 'svelte/store';

export type WizardStore = {
    show: boolean;
    media?: string;
    component?: ComponentType;
    interceptor?: () => Promise<void>;
    nextDisabled: boolean;
};

function createWizardStore() {
    const { subscribe, update, set } = writable<WizardStore>({
        show: false,
        component: null,
        interceptor: null,
        media: null,
        nextDisabled: false
    });

    return {
        subscribe,
        set,
        start: (component: ComponentType, media: string = null) =>
            update((n) => {
                n.show = true;
                n.component = component;
                n.interceptor = null;
                n.media = media;
                trackEvent('wizard_start');
                return n;
            }),
        setInterceptor: (callback: WizardStore['interceptor']) => {
            update((n) => {
                n.interceptor = callback;
                return n;
            });
        },
        setNextDisabled: (disabled: boolean) => {
            update((n) => {
                n.nextDisabled = disabled;
                return n;
            });
        },
        hide: () =>
            update((n) => {
                n.show = false;
                n.component = null;
                n.interceptor = null;
                n.media = null;

                return n;
            })
    };
}

export const wizard = createWizardStore();
