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
    oauthProviders: Partial<Record<Logins, OAuthProvider>>;
    css: string;
    showOnboarding: boolean;
    useCommandCenter: boolean;
    showGithubIssueSupport: boolean;
    showExtendedAccountsMenu: boolean;
    showGeneralAvailability: boolean;
    showConnectProjectOnToolbar: boolean;
    showProgressBar: boolean;
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
};

export const base: Profile = {
    id: ProfileMode.CONSOLE,
    platform: 'Appwrite',
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
        github: OAuthProvider.Github
    },
    css: ConsoleCss,
    showOnboarding: true,
    useCommandCenter: true,
    showGithubIssueSupport: true,
    showExtendedAccountsMenu: false,
    showGeneralAvailability: true,
    showConnectProjectOnToolbar: true,
    showProgressBar: true,
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
    }
};

export const studio: Profile = {
    id: ProfileMode.STUDIO,
    platform: 'Imagine',
    organizationPlatform: Platform.Imagine,
    freeTier: BillingPlan.Imaginetier0,
    logo: {
        src: {
            dark: asset('/images/imagine-logo-dark.svg'),
            light: asset('/images/imagine-logo-light.svg')
        },
        alt: 'Imagine Appwrite'
    },
    logins: [/** temporary */ Logins.EMAIL, Logins.GITHUB, Logins.GOOGLE].filter(Boolean),
    oauthProviders: {
        github: OAuthProvider.GithubImagine,
        google: OAuthProvider.GoogleImagine
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
    }
};

const resolver = $derived(() => {
    switch (env.PUBLIC_CONSOLE_PROFILE) {
        case 'studio':
            return studio;
        default:
            return base;
    }
});

export const resolvedProfile = resolver();
