import { page } from '$app/stores';
import { get } from 'svelte/store';
import type { Metric } from 'web-vitals';
import { isObject, isObjectType } from './type';

type Options = {
    params:
        | {
              [s: string]: string;
          }
        | ArrayLike<string>;
    path: string;
    analyticsId: string;
    debug?: boolean;
};

const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals';

type Navigator = {
    connection: {
        effectiveType: unknown;
    };
};

function isNavigator(obj: unknown): obj is Navigator {
    return isObjectType<Navigator>(obj, {
        connection: (v) => isObject(v) && 'effectiveType' in v
    });
}

function getConnectionSpeed() {
    return isNavigator(navigator) ? navigator['connection']['effectiveType'] : '';
}

function sendToAnalytics(metric: Metric, options: Options) {
    const page = Object.entries(options.params).reduce(
        (acc, [key, value]) => acc.replace(value, `[${key}]`),
        options.path
    );

    const body = {
        dsn: options.analyticsId,
        id: metric.id,
        page,
        href: location.href,
        event_name: metric.name,
        value: metric.value.toString(),
        speed: getConnectionSpeed()
    };

    if (options.debug) {
        console.log('[Analytics]', metric.name, JSON.stringify(body, null, 2));
    }

    // TODO: verify if this cast is okay, or find an alternative
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = new Blob([new URLSearchParams(body as any).toString()], {
        // This content type is necessary for `sendBeacon`
        type: 'application/x-www-form-urlencoded'
    });

    if (navigator.sendBeacon) {
        navigator.sendBeacon(vitalsUrl, blob);
    } else
        fetch(vitalsUrl, {
            body: blob,
            method: 'POST',
            credentials: 'omit',
            keepalive: true
        });
}

export function reportWebVitals(metric: Metric) {
    try {
        sendToAnalytics(metric, createWebVitalsOptions());
    } catch (err) {
        console.error('[Analytics]', err);
    }
}

function createWebVitalsOptions(): Options {
    const ctx = get(page);
    return {
        path: ctx.url.pathname,
        params: ctx.params,
        analyticsId: window.VERCEL_ANALYTICS_ID || ''
    };
}
