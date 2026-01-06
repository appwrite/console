import { asset, resolve } from '$app/paths';
import type { ResolvedPathname } from '$app/types';
import { OAuthProvider, Platform } from '@appwrite.io/console';
import { env } from '$env/dynamic/public';
import { BillingPlan } from '@appwrite.io/console';
import type { Component } from 'svelte';
import UnauthenticatedConsole from './(unauthenticated)/console.svelte';
import UnauthenticatedStudio from './(unauthenticated)/studio.svelte';
import StudioCss from './css/studio.css?url';
import ConsoleCss from './css/console.css?url';
import { isCloud } from '$lib/system';
import { dev } from '$app/environment';
import { PUBLIC_APPWRITE_ENDPOINT } from '$env/static/public';

export const enum ProfileMode {
    STUDIO = 'studio',
    CONSOLE = 'console'
}
export const enum Logins {
    EMAIL = 'email',
    GITHUB = 'github',
    GOOGLE = 'google'
}

export type Profile = {
    id: ProfileMode;
    platform: string;
    organizationPrefKey: string; // used in prefs!
    organizationPlatform: Platform;
    freeTier: BillingPlan;
    logo: {
        src: {
            dark: string;
            light: string;
        };
        alt: string;
    };
    logins: Array<Logins>;
    oauthProviders: Partial<Record<Logins, { provider: OAuthProvider; scopes: string[] }>>;
    css: string;
    showOnboarding: boolean;
    useCommandCenter: boolean;
    showGithubIssueSupport: boolean;
    showExtendedAccountsMenu: boolean;
    showGeneralAvailability: boolean;
    showConnectProjectOnToolbar: boolean;
    showProgressBar: boolean;
    showCreateOrganization: boolean;
    services: {
        'get-started': boolean;
        overview: boolean;
        auth: boolean;
        databases: boolean;
        functions: boolean;
        messaging: boolean;
        storage: boolean;
        sites: boolean;
        settings: boolean;
    };
    showOrgInBreadcrumbs: boolean;
    minimalOrgHeader: boolean;
    getProjectRoute: (params: { region: string; project: string }) => ResolvedPathname;
    component: {
        unauthenticated: Component;
    };
    links: {
        docs: string;
        website: string;
        discord: string;
        terms: string;
        privacy: string;
        cookies: string;
        pricing: string;
        github?: string;
        status: string;
    };
    support: {
        technical: string[];
    };
    analytics: {
        plausible?: string;
    };
};

export const base: Profile = {
    id: ProfileMode.CONSOLE,
    platform: 'Appwrite',
    organizationPrefKey: 'organization',
    organizationPlatform: Platform.Appwrite,
    freeTier: BillingPlan.Tier0,
    logo: {
        src: {
            dark: asset('/images/appwrite-logo-dark.svg'),
            light: asset('/images/appwrite-logo-light.svg')
        },
        alt: 'Logo Appwrite'
    },
    component: {
        unauthenticated: UnauthenticatedConsole
    },
    logins: [Logins.EMAIL, isCloud && Logins.GITHUB].filter(Boolean),
    oauthProviders: {
        github: {
            provider: OAuthProvider.Github,
            scopes: ['read:user', 'user:email']
        }
    },
    css: ConsoleCss,
    showOnboarding: true,
    useCommandCenter: true,
    showGithubIssueSupport: true,
    showExtendedAccountsMenu: false,
    showGeneralAvailability: true,
    showConnectProjectOnToolbar: true,
    showProgressBar: true,
    showCreateOrganization: true,
    services: {
        'get-started': true,
        overview: true,
        auth: true,
        databases: true,
        functions: true,
        messaging: true,
        storage: true,
        sites: true,
        settings: true
    },
    showOrgInBreadcrumbs: true,
    minimalOrgHeader: false,
    getProjectRoute({ region, project }) {
        return resolve(`/(console)/project-[region]-[project]/overview`, {
            region,
            project
        });
    },
    links: {
        website: 'https://appwrite.io',
        docs: 'https://appwrite.io/docs',
        terms: 'https://appwrite.io/terms',
        discord: 'https://appwrite.io/discord',
        cookies: 'https://appwrite.io/cookies',
        privacy: 'https://appwrite.io/privacy',
        pricing: 'https://appwrite.io/pricing',
        github: 'https://github.com/appwrite/appwrite',
        status: 'https://status.appwrite.online'
    },
    support: {
        technical: [
            'Auth',
            'Databases',
            'Storage',
            'Functions',
            'Realtime',
            'Messaging',
            'Migrations',
            'Webhooks',
            'SDKs',
            'Console',
            'Backups',
            'Blocked project',
            'Domains',
            'Outage',
            'Platforms',
            'Sites',
            'Other'
        ]
    },
    analytics: {
        plausible: isCloud ? 'cloud.appwrite.io' : 'self-hosted.appwrite'
    }
};

export const studio: Profile = {
    id: ProfileMode.STUDIO,
    platform: 'Imagine',
    organizationPrefKey: 'imagine-organization',
    organizationPlatform: Platform.Imagine,
    freeTier: BillingPlan.Imaginetier0,
    logo: {
        src: {
            dark: asset('/images/imagine-logo-dark.svg'),
            light: asset('/images/imagine-logo-light.svg')
        },
        alt: 'Imagine Appwrite'
    },
    logins: [
        (dev || PUBLIC_APPWRITE_ENDPOINT.includes('staging')) && Logins.EMAIL,
        Logins.GITHUB,
        Logins.GOOGLE
    ].filter(Boolean),
    oauthProviders: {
        github: {
            provider: OAuthProvider.GithubImagine,
            scopes: ['read:user', 'user:email']
        },
        google: {
            provider: OAuthProvider.GoogleImagine,
            scopes: ['openid', 'email', 'profile']
        }
    },
    css: StudioCss,
    component: {
        unauthenticated: UnauthenticatedStudio
    },
    showOnboarding: false,
    useCommandCenter: false,
    showGithubIssueSupport: false,
    showExtendedAccountsMenu: true,
    showGeneralAvailability: false,
    showConnectProjectOnToolbar: false,
    showProgressBar: false,
    showCreateOrganization: false,
    services: {
        'get-started': false,
        overview: false,
        auth: true,
        databases: true,
        functions: false,
        messaging: false,
        storage: true,
        sites: false,
        settings: true
    },
    showOrgInBreadcrumbs: false,
    minimalOrgHeader: true,
    getProjectRoute({ region, project }) {
        return resolve(`/(console)/project-[region]-[project]/(studio)/studio`, {
            region,
            project
        });
    },
    links: {
        website: 'https://imagine.dev',
        docs: 'https://imagine.dev',
        terms: 'https://imagine.dev/terms',
        discord: 'https://imagine.dev/discord',
        cookies: 'https://imagine.dev/cookies',
        privacy: 'https://imagine.dev/privacy',
        pricing: 'https://imagine.dev/pricing',
        status: 'https://status.imagine.dev'
    },
    support: {
        technical: [
            'AI issue',
            'Generation error',
            'Preview not working',
            'Auth',
            'Databases',
            'Storage',
            'Other'
        ]
    },
    analytics: {
        plausible: 'studio.imagine.dev'
    }
};

export const resolvedProfile = env.PUBLIC_CONSOLE_PROFILE === 'studio' ? studio : base;
