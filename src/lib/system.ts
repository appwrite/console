export enum Mode {
    CLOUD = 'cloud',
    SELF_HOSTED = 'self-hosted'
}

export enum Tier {
    BASE = 'base',
    PREMIUM = 'premium',
    ENTERPRISE = 'enterprise'
}

export const VARS = {
    APPWRITE_ENDPOINT: import.meta.env?.VITE_APPWRITE_ENDPOINT?.toString() as string | undefined,
    GROWTH_ENDPOINT: import.meta.env?.VITE_APPWRITE_GROWTH_ENDPOINT?.toString() as
        | string
        | undefined,
    CONSOLE_MODE: import.meta.env?.VITE_CONSOLE_MODE?.toString() as string | undefined,
    CONSOLE_TIER: import.meta.env?.VITE_CONSOLE_TIER?.toString() as string | undefined,
    VERCEL_ENV: import.meta.env?.VITE_VERCEL_ENV?.toString() as string | undefined,
    GOOGLE_ANALYTICS: import.meta.env?.VITE_GA_PROJECT?.toString() as string | undefined
};

export const ENV = {
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    PREVIEW: VARS.VERCEL_ENV === 'preview',
    TEST: !!import.meta.env?.VITEST
};

export const MODE = VARS.CONSOLE_MODE === Mode.CLOUD ? Mode.CLOUD : Mode.SELF_HOSTED;
export const isCloud = MODE === Mode.CLOUD;
export const isSelfHosted = MODE === Mode.SELF_HOSTED;
export const TIER =
    VARS.CONSOLE_TIER === Tier.BASE
        ? Tier.BASE
        : VARS.CONSOLE_TIER === Tier.PREMIUM
        ? Tier.PREMIUM
        : Tier.ENTERPRISE;
export const isFree = VARS.CONSOLE_TIER === Tier.BASE;
export const isPremium = VARS.CONSOLE_TIER === Tier.PREMIUM;
export const isEnterprise = VARS.CONSOLE_TIER === Tier.ENTERPRISE;
