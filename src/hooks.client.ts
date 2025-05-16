import * as Sentry from '@sentry/sveltekit';
import { AppwriteException } from '@appwrite.io/console';
import type { HandleClientError } from '@sveltejs/kit';
import { isCloud, isProd, isStudio } from '$lib/system';

Sentry.init({
    enabled: isCloud && isProd,
    dsn: 'https://c7ce178bdedd486480317b72f282fd39@o1063647.ingest.us.sentry.io/4504158071422976',
    tracesSampleRate: 1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0
});

function setFavicon() {
    const favicon = isStudio ? 'imagine-icon.svg' : 'appwrite-icon.svg';
    const maskIcon = isStudio ? 'imagine-icon.png' : 'appwrite-icon.png';
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = '/console/logos/' + favicon;
    link.type = 'image/svg+xml';
    document.head.appendChild(link);

    const maskLink = document.createElement('link');
    maskLink.rel = 'mask-icon';
    link.href = '/console/logos/' + maskIcon;
    link.type = 'image/png';
    document.head.appendChild(maskLink);
}

setFavicon();

export const handleError: HandleClientError = Sentry.handleErrorWithSentry(
    async ({ error, message, status }) => {
        console.error(error);
        if (error instanceof AppwriteException) {
            status = error.code === 0 ? undefined : error.code;
            message = error.message;
        }

        return {
            message,
            status
        };
    }
);
