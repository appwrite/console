import { env } from '$env/dynamic/public';
import { dev } from '$app/environment';

export const enum Mode {
    CLOUD = 'cloud',
    SELF_HOSTED = 'self-hosted'
}

export const VARS = {
    CONSOLE_MODE: (env.PUBLIC_CONSOLE_MODE as Mode) ?? undefined,
    APPWRITE_ENDPOINT: env.PUBLIC_APPWRITE_ENDPOINT ?? undefined,
    GROWTH_ENDPOINT: env.PUBLIC_GROWTH_ENDPOINT ?? undefined,
    PUBLIC_STRIPE_KEY: env.PUBLIC_STRIPE_KEY ?? undefined
};

export const ENV = {
    DEV: dev,
    PROD: !dev,
    PREVIEW: import.meta.env?.VERCEL === '1',
    TEST: !!import.meta.env?.VITEST
};

export const MODE = VARS.CONSOLE_MODE === Mode.CLOUD ? Mode.CLOUD : Mode.SELF_HOSTED;
export const isCloud = MODE === Mode.CLOUD;
export const isSelfHosted = MODE !== Mode.CLOUD;
export const isDev = ENV.DEV;
export const isProd = ENV.PROD;
export const hasStripePublicKey = !!VARS.PUBLIC_STRIPE_KEY;
export const GRACE_PERIOD_OVERRIDE = false;

/**
 * Determines if the endpoint points to the Appwrite Cloud domain family.
 *
 * This includes both the default `cloud.appwrite.io` and any region-specific subdomains
 * like `fra.cloud.appwrite.io`, `nyc.cloud.appwrite.io`, etc.
 *
 * This check is required when using custom domains, which are typically `CNAME`'d
 * to region-based API endpoints. These custom domains do not include a region subdomain,
 * so this logic helps infer cloud hosting context reliably.
 */
export const isCloudHostname = (() => {
    try {
        return new URL(VARS.APPWRITE_ENDPOINT).hostname.endsWith('cloud.appwrite.io');
    } catch {
        return false;
    }
})();
