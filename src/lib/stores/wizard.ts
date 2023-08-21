import { trackEvent } from '$lib/actions/analytics';
import type { ComponentType } from 'svelte';
import { writable } from 'svelte/store';

export type WizardStore = {
    show: boolean;
    media?: string;
    component?: ComponentType;
    interceptor?: () => Promise<void>;
    nextDisabled: boolean;
    step: number;
};

function createWizardStore() {
    const { subscribe, update, set } = writable<WizardStore>({
        show: false,
        component: null,
        interceptor: null,
        media: null,
        nextDisabled: false,
        step: 1
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
                n.step = 1;
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
                n.step = 1;

                return n;
            }),
        updateStep: (cb: (prevStep: number) => number) => {
            update((n) => {
                n.step = cb(n.step);
                return n;
            });
        },
        setStep: (step: number) => {
            update((n) => {
                n.step = step;
                return n;
            });
        }
    };
}

export const wizard = createWizardStore();
