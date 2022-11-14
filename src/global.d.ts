/// <reference types="@sveltejs/kit" />
interface Window {
    VERCEL_ANALYTICS_ID: string | false;
    SENTRY_DSN: string | false;
}
