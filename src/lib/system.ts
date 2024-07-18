import { env } from '$env/dynamic/public';
import { PUBLIC_CONSOLE_MODE } from '$env/static/public';

export const enum Mode {
    CLOUD = 'cloud',
    SELF_HOSTED = 'self-hosted'
}

export const VARS = {
    CONSOLE_MODE: PUBLIC_CONSOLE_MODE as Mode,
    APPWRITE_ENDPOINT: env.PUBLIC_APPWRITE_ENDPOINT,
    GROWTH_ENDPOINT: env.PUBLIC_GROWTH_ENDPOINT ?? undefined,
    PUBLIC_STRIPE_KEY: env.PUBLIC_STRIPE_KEY ?? undefined,
};

export const ENV = {
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    PREVIEW: import.meta.env?.VERCEL === '1',
    TEST: !!import.meta.env?.VITEST
};

export const MODE = VARS.CONSOLE_MODE === Mode.CLOUD ? Mode.CLOUD : Mode.SELF_HOSTED;
export const isCloud = MODE === Mode.CLOUD;
export const isSelfHosted = MODE !== Mode.CLOUD;
export const hasStripePublicKey = !!VARS.PUBLIC_STRIPE_KEY;
export const GRACE_PERIOD_OVERRIDE = false;
