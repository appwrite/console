/// <reference types="@sveltejs/kit" />
/// <reference types="@types/gtag.js" />
interface Window {
    GOOGLE_ANALYTICS: string | false;
    VERCEL_ANALYTICS_ID: string | false;
}
