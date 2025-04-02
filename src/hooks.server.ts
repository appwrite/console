import { sequence } from '@sveltejs/kit/hooks';
import { handleErrorWithSentry, sentryHandle } from '@sentry/sveltekit';
import * as Sentry from '@sentry/sveltekit';
import { isCloud, isProd } from '$lib/system';
import type { Handle } from '@sveltejs/kit';

Sentry.init({
    enabled: isCloud && isProd,
    dsn: 'https://c7ce178bdedd486480317b72f282fd39@o1063647.ingest.us.sentry.io/4504158071422976',
    tracesSampleRate: 1.0
});

const projectProfile = process.env.PUBLIC_PROJECT_PROFILE || 'console';

const dynamicHtmlTransform: Handle = async ({ event, resolve }) => {
    let response = await resolve(event);

    if (response.headers.get('content-type')?.includes('text/html')) {
        let html = await response.text();

        // Replace '/console/' dynamically with the project profile
        html = html.replace(/\/{project_profile}\//g, `/${projectProfile}/`);

        response = new Response(html, {
            status: response.status,
            headers: response.headers
        });
    }

    return response;
};

export const handle = sequence(sentryHandle(), dynamicHtmlTransform);

export const handleError = handleErrorWithSentry();
