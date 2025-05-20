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
