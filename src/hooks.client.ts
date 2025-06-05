import * as Sentry from '@sentry/sveltekit';
import { isCloud, isProd } from '$lib/system';
import { AppwriteException } from '@appwrite.io/console';
import type { HandleClientError } from '@sveltejs/kit';

Sentry.init({
    enabled: isCloud && isProd,
    dsn: 'https://c7ce178bdedd486480317b72f282fd39@o1063647.ingest.us.sentry.io/4504158071422976',
    tracesSampleRate: 1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0
});

export const handleError: HandleClientError = ({ error, message, status }) => {
    console.error(error);

    let type;
    if (error instanceof AppwriteException) {
        status = error.code === 0 ? undefined : error.code;
        message = error.message;
        type = error.type;
    }

    return {
        message,
        status,
        type
    };
};
