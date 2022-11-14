/// <reference types="@sveltejs/kit" />
/// <reference types="@types/gtag.js" />
interface Window {
    VERCEL_ANALYTICS_ID: string | false;
    SENTRY_DSN: string | false;
}
