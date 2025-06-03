import * as Sentry from '@sentry/sveltekit';
import { isCloud, isProd, isStudio } from '$lib/system';
import { AppwriteException } from '@appwrite.io/console';
import type { HandleClientError } from '@sveltejs/kit';

Sentry.init({
    enabled: isCloud && isProd,
    dsn: 'https://c7ce178bdedd486480317b72f282fd39@o1063647.ingest.us.sentry.io/4504158071422976',
    tracesSampleRate: 1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0
});

function setLoader() {
    if (document.getElementsByTagName('body').length > 0) {
        const color = isStudio
            ? themeInUse === 'light'
                ? 'rgba(86, 86, 92, 100%)'
                : 'rgba(195, 195, 198, 100%)'
            : 'rgb(219, 26, 90)';
        document
            .getElementsByTagName('body')[0]
            .setAttribute('style', '--console-loading-color: ' + color);
    }

    document.getElementById('loader-logo').innerHTML = isStudio
        ? '<img src="/console/images/imagine-logo-light.svg" class="logo-light" width="96" height="24" alt="Imagine Logo"/><img src="/console/images/imagine-logo-dark.svg" class="logo-dark" width="96" height="24" alt="Imagine Logo"/>'
        : '<img src="/console/images/appwrite-logo-light.svg" width="120" height="22" class="logo-light" alt="Appwrite Logo" /> <img src="/console/images/appwrite-logo-dark.svg" width="120" height="22" class="logo-dark" alt="Appwrite Logo" />';
}

setLoader();

export const handleError: HandleClientError = ({ error, message, status }) => {
    console.error(error);
    if (error instanceof AppwriteException) {
        status = error.code === 0 ? undefined : error.code;
        message = error.message;
    }

    return {
        message,
        status
    };
};
