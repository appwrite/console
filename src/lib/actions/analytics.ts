import type { Action } from 'svelte/action';

export type AnalyticsActionParam = {
    name: string;
    action: string;
    parameters?: Record<string, string>;
    event?: keyof HTMLElementEventMap;
};

export const event: Action<HTMLElement, AnalyticsActionParam> = (node, param) => {
    if (!isTrackingAllowed()) {
        return;
    }

    node.addEventListener('click', () =>
        gtag('event', param.name, {
            ...param.parameters,
            action: param.action
        })
    );
};

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
