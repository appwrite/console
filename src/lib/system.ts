import { env } from '$env/dynamic/public';
import { dev } from '$app/environment';
import { getApiEndpoint } from '$lib/stores/sdk';

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
 * Returns true if multi-region is supported.
 */
export function isMultiRegionSupported(): boolean {
    if (env.PUBLIC_APPWRITE_MULTI_REGION === 'true') return true;

    try {
        return new URL(getApiEndpoint()).hostname.endsWith('cloud.appwrite.io');
    } catch {
        return false;
    }
}
