export enum Mode {
    CLOUD = 'cloud',
    SELF_HOSTED = 'self-hosted'
}

export const VARS = {
    APPWRITE_ENDPOINT: import.meta.env?.VITE_APPWRITE_ENDPOINT?.toString() as string | undefined,
    GROWTH_ENDPOINT: import.meta.env?.VITE_APPWRITE_GROWTH_ENDPOINT?.toString() as
        | string
        | undefined,
    CONSOLE_MODE: import.meta.env?.VITE_CONSOLE_MODE?.toString() as string | undefined,
    STRIPE_PUBLIC_KEY: import.meta.env?.VITE_STRIPE_PUBLIC_KEY?.toString() as string | undefined
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
export const hasStripePublicKey = !!VARS.STRIPE_PUBLIC_KEY;
export const GRACE_PERIOD_OVERRIDE = true;
