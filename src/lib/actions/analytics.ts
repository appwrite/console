import Analytics from 'analytics';
import googleAnalytics from '@analytics/google-analytics';
import { get } from 'svelte/store';
import { page } from '$app/stores';
import { user } from '$lib/stores/user';

const analytics = Analytics({
    app: 'appwrite',
    plugins: [
        googleAnalytics({
            measurementIds: ['G-R4YJ9JN8L4']
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
    const { email, name } = get(user);

    fetch('https://growth.appwrite.io/v1/analytics', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: event,
            url: window.location.origin + path,
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
