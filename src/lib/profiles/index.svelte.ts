import { resolve } from '$app/paths';
import type { ResolvedPathname } from '$app/types';
import { PUBLIC_CONSOLE_PROFILE } from '$env/static/public';

export const enum ProfileMode {
    STUDIO = 'studio',
    CONSOLE = 'console'
}

export type Profile = {
    id: ProfileMode;
    platform: string;
    logo: {
        src: {
            dark: string;
            light: string;
        };
        alt: string;
    };
    showOnboarding: boolean;
    useCommandCenter: boolean;
    showGithubIssueSupport: boolean;
    showExtendedAccountsMenu: boolean;
    showGeneralAvailability: boolean;
    showConnectProjectOnToolbar: boolean;
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
};

export const base: Profile = {
    id: ProfileMode.CONSOLE,
    platform: 'Appwrite',
    logo: {
        src: {
            dark: 'https://appwrite.io/images/logos/logo.svg',
            light: 'https://appwrite.io/images/logos/logo.svg'
        },
        alt: 'Logo Appwrite'
    },
    showOnboarding: true,
    useCommandCenter: true,
    showGithubIssueSupport: true,
    showExtendedAccountsMenu: false,
    showGeneralAvailability: true,
    showConnectProjectOnToolbar: true,
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
    logo: {
        src: {
            dark: 'https://imagine-console.up.railway.app/images/imagine-logo-dark.svg',
            light: 'https://imagine-console.up.railway.app/images/imagine-logo-light.svg'
        },
        alt: 'Imagine Appwrite'
    },
    showOnboarding: false,
    useCommandCenter: false,
    showGithubIssueSupport: false,
    showExtendedAccountsMenu: true,
    showGeneralAvailability: false,
    showConnectProjectOnToolbar: false,
    services: {
        'get-started': false,
        overview: false,
        auth: true,
        databases: true,
        functions: false,
        messaging: false,
        storage: true,
        sites: true,
        settings: false
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
    switch (PUBLIC_CONSOLE_PROFILE) {
        case 'studio':
            return studio;
        default:
            return base;
    }
});

export const resolvedProfile = resolver();
