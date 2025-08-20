import { trackEvent } from '$lib/actions/analytics';
import type { WizardStepsType } from '$lib/layout/wizardWithSteps.svelte';
import type { Component } from 'svelte';
import { writable } from 'svelte/store';

export type WizardStore = {
    show: boolean;
    media?: string;
    component?: Component;
    cover?: Component;
    interceptor?: () => Promise<void>;
    finalAction?: () => Promise<void>;
    nextDisabled: boolean;
    step: number;
    interceptorNotificationEnabled: boolean;
    props: Record<string, unknown>;
};

function createWizardStore() {
    const { subscribe, update, set } = writable<WizardStore>({
        show: false,
        component: null,
        cover: null,
        interceptor: null,
        interceptorNotificationEnabled: true,
        media: null,
        nextDisabled: false,
        step: 1,
        finalAction: null,
        props: {}
    });

    return {
        subscribe,
        set,
        start: (
            component: Component,
            media: string = null,
            step: number = 1,
            props: Record<string, unknown> = {}
        ) =>
            update((n) => {
                n.show = true;
                n.component = component;
                n.interceptor = null;
                n.interceptorNotificationEnabled = true;
                n.media = media;
                n.step = step;
                n.cover = null;
                n.nextDisabled = false;
                n.finalAction = null;
                n.props = props;
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
                n.interceptorNotificationEnabled = true;
                n.media = null;
                n.step = 1;
                n.cover = null;
                n.nextDisabled = false;
                n.finalAction = null;

                return n;
            }),
        showCover: (component: Component) =>
            update((n) => {
                n.cover = component;
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

export const isNewWizardStatusOpen = writable(false);

export function updateStepStatus(map: WizardStepsType, key: number, status: boolean) {
    const updatedComponent = {
        ...map.get(key),
        disabled: status
    };
    map.set(key, updatedComponent);
    return map;
}
