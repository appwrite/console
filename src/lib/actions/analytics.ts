import type { Action } from 'svelte/action';

export type AnalyticsActionParam = {
    name: string;
    action?: string;
    category?: string;
    label?: string;
    parameters?: Record<string, string>;
    event?: keyof HTMLElementEventMap;
};

export const event: Action<HTMLElement, Partial<AnalyticsActionParam>> = (node, param) => {
    if (!isTrackingAllowed()) {
        return;
    }

    node.addEventListener(param.event ?? 'click', () => {
        gtag('event', param.name, {
            ...param.parameters,
            action: param.action
        });
    });
};

export function sendEvent(event: {
    action: string;
    label?: string;
    category?: string;
    data?: object;
}): void {
    console.log(`send event ${event.action}`)
    //TODO: implement analytics
}

const isTrackingAllowed = () => {
    if (!('gtag' in window)) {
        return false;
    }

    if (window.navigator?.doNotTrack) {
        if (navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes') {
            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }
};
