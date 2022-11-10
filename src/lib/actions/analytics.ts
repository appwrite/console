import Analytics from 'analytics';
import googleAnalytics from '@analytics/google-analytics';
import { dev } from '$app/environment';
import { get } from 'svelte/store';
import { page } from '$app/stores';

const analytics = Analytics({
    app: 'appwrite',
    debug: dev,
    plugins: [
        googleAnalytics({
            measurementIds: [globalThis.GOOGLE_ANALYTICS]
        })
    ]
});
analytics.on('track', (n) => console.log(n.payload.event, n.payload.properties));
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
