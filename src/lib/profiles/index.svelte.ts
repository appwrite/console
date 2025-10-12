import { resolve } from '$app/paths';
import { PUBLIC_CONSOLE_PROFILE } from '$env/static/public';
import type { ResolvedPathname } from '$app/types';

type Profile = {
    id: 'console' | 'studio';
    logo: {
        src: {
            dark: string;
            light: string;
        };
        alt: string;
    };
    showOnboarding: boolean;
    getProjectRoute: (params: { region: string; project: string }) => ResolvedPathname;
};

export const base: Profile = {
    id: 'console',
    logo: {
        src: {
            dark: 'https://appwrite.io/images/logos/logo.svg',
            light: 'https://appwrite.io/images/logos/logo.svg'
        },
        alt: 'Logo Appwrite'
    },
    showOnboarding: true,
    getProjectRoute({ region, project }) {
        return resolve(`/(console)/project-[region]-[project]/overview`, {
            region,
            project
        });
    }
};

export const studio: Profile = {
    id: 'studio',
    logo: {
        src: {
            dark: 'https://imagine-console.up.railway.app/images/imagine-logo-dark.svg',
            light: 'https://imagine-console.up.railway.app/images/imagine-logo-light.svg'
        },
        alt: 'Imagine Appwrite'
    },
    showOnboarding: false,
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
