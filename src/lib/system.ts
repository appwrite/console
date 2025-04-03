import { env } from '$env/dynamic/public';
import { dev } from '$app/environment';
import { ConsoleCloudProfile, ConsoleSelfhostedProfile, StudioProfile } from '$lib/profiles';

export const enum Mode {
    CLOUD = 'cloud',
    SELF_HOSTED = 'self-hosted'
}

export const enum Profile {
    CONSOLE = 'console',
    STUDIO = 'studio'
}

export const VARS = {
    CONSOLE_MODE: (env.PUBLIC_CONSOLE_MODE as Mode) ?? undefined,
    APPWRITE_ENDPOINT: env.PUBLIC_APPWRITE_ENDPOINT ?? undefined,
    GROWTH_ENDPOINT: env.PUBLIC_GROWTH_ENDPOINT ?? undefined,
    PUBLIC_STRIPE_KEY: env.PUBLIC_STRIPE_KEY ?? undefined,
    PROJECT_PROFILE: (env.PUBLIC_PROJECT_PROFILE as Profile) ?? undefined
};

export const ENV = {
    DEV: dev,
    PROD: !dev,
    PREVIEW: import.meta.env?.VERCEL === '1',
    TEST: !!import.meta.env?.VITEST
};

function getProfile() {
    if (PROFILE === Profile.STUDIO) {
        return StudioProfile;
    } else if (MODE === Mode.CLOUD) {
        return ConsoleCloudProfile;
    } else {
        return ConsoleSelfhostedProfile;
    }
}

export const MODE = VARS.CONSOLE_MODE === Mode.CLOUD ? Mode.CLOUD : Mode.SELF_HOSTED;
export const PROFILE = VARS.PROJECT_PROFILE === Profile.CONSOLE ? Profile.CONSOLE : Profile.STUDIO;
export const isCloud = MODE === Mode.CLOUD;
export const isStudio = PROFILE === Profile.STUDIO;
export const isSelfHosted = MODE !== Mode.CLOUD;
export const isDev = ENV.DEV;
export const isProd = ENV.PROD;
export const hasStripePublicKey = !!VARS.PUBLIC_STRIPE_KEY;
export const GRACE_PERIOD_OVERRIDE = false;
export const consoleProfile = getProfile();
