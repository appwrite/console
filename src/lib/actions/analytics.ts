import Analytics from 'analytics';
import googleAnalytics from '@analytics/google-analytics';
import { get } from 'svelte/store';
import { page } from '$app/stores';

const analytics = Analytics({
    app: 'appwrite',
    plugins: [
        googleAnalytics({
            measurementIds: [import.meta.env.VITE_GOOGLE_ANALYTICS?.toString()]
        })
    ]
});

export function trackEvent(name: string, data: object = null): void {
    if (!isTrackingAllowed()) {
        return;
    }

    analytics.track(name, { ...data, path: get(page).routeId });
}

export function trackPageView(path: string) {
    if (!isTrackingAllowed()) {
        return;
    }

    analytics.page({
        path
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
