import { trackEvent } from '$lib/actions/analytics';
import type { WizardStepsType } from '$lib/layout/wizard.svelte';
import type { SvelteComponent } from 'svelte';
import { writable } from 'svelte/store';

export type WizardStore = {
    show: boolean;
    media?: string;
    component?: typeof SvelteComponent;
    interceptor?: () => Promise<void>;
};

function createWizardStore() {
    const { subscribe, update, set } = writable<WizardStore>({
        show: false,
        component: null,
        interceptor: null,
        media: null
    });

    return {
        subscribe,
        set,
        start: (component: typeof SvelteComponent, media: string = null) =>
            update((n) => {
                n.show = true;
                n.component = component;
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
        hide: () =>
            update((n) => {
                n.show = false;
                n.component = null;
                n.media = null;

                return n;
            })
    };
}

export const wizard = createWizardStore();

export function updateStepStatus(map: WizardStepsType, key: number, status: boolean) {
    const updatedComponent = {
        ...map.get(key),
        disabled: status
    };
    map.set(key, updatedComponent);
    return map;
}
