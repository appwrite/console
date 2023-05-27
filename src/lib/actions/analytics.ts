import Analytics from 'analytics';
import googleAnalytics from '@analytics/google-analytics';
import { get } from 'svelte/store';
import { page } from '$app/stores';
import { user } from '$lib/stores/user';
import { growthEndpoint, Mode } from '$lib/constants';

const analytics = Analytics({
    app: 'appwrite',
    plugins: [
        googleAnalytics({
            measurementIds: [import.meta.env.VITE_GA_PROJECT?.toString() || 'G-R4YJ9JN8L4']
        })
    ]
});

export function trackEvent(name: string, data: object = null): void {
    if (!isTrackingAllowed()) {
        return;
    }
    const path = get(page).routeId;
    analytics.track(name, { ...data, path });
    sendEventToGrowth(name, path, data);
}

export function trackPageView(path: string) {
    if (!isTrackingAllowed()) {
        return;
    }

    analytics.page({
        path
    });
}

function sendEventToGrowth(event: string, path: string, data: object = null): void {
    let email: string, name: string;
    const userStore = get(user);
    if (userStore) {
        email = userStore.email;
        name = userStore.name;
    }
    fetch(`${growthEndpoint}/analytics`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: event,
            label: event,
            url: window.location.origin + path,
            account: import.meta.env.VITE_CONSOLE_MODE?.toString() || Mode.SELF_HOSTED,
            data: {
                email,
                name,
                ...data
            }
        })
    });
}

function isTrackingAllowed() {
    if (window.navigator?.doNotTrack) {
        if (navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes') {
            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }
}
