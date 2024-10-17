import { sequence } from '@sveltejs/kit/hooks';
import { handleErrorWithSentry, sentryHandle } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';
import { isCloud, isProd } from '$lib/system';

Sentry.init({
    enabled: isCloud && isProd,
    dsn: 'https://c7ce178bdedd486480317b72f282fd39@o1063647.ingest.us.sentry.io/4504158071422976',
    tracesSampleRate: 1.0
});

const securityHeaders = {
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Content-Security-Policy': `default-src 'self'; script-src 'report-sample' 'self' https://js.stripe.com/v3; style-src 'report-sample' 'self'; object-src 'none'; base-uri 'self'; connect-src 'self' https://growth.appwrite.io https://*.sentry.io https://plausible.io; font-src 'self' https://fonts.appwrite.io; frame-src 'self' https://js.stripe.com; img-src 'self'; manifest-src 'self'; media-src 'self'; worker-src 'self' blob:;` // We can also add a report-uri for CSP violations e.g. 'report-uri https://some-endpoint/;'
};

async function setSecurityHeaders({ event, resolve }) {
    const response = await resolve(event);
    if (isCloud && isProd) {
        Object.entries(securityHeaders).forEach(([header, value]) =>
            response.headers.set(header, value)
        );
    }

    return response;
}

export const handle = sequence(setSecurityHeaders, sentryHandle());

export const handleError = handleErrorWithSentry();
