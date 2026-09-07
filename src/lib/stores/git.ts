import { page } from '$app/state';
import type { Models } from '@appwrite.io/console';
import type { ComponentType } from 'svelte';
import { IconGithub } from '@appwrite.io/pink-icons-svelte';
import IconGitea from '$lib/components/git/IconGitea.svelte';
import IconOrigin from '$lib/components/git/IconOrigin.svelte';
import { isSelfHosted } from '$lib/system';
import { getApiEndpoint } from './sdk';

export type VcsProviderId = 'github' | 'origin' | 'gitea';

export interface VcsProviderMeta {
    id: VcsProviderId;
    label: string;
    icon: ComponentType;
    /** Web URL of an owner/organization on the provider, or '' when the host is not knowable client-side. */
    organizationUrl: (organization: string) => string;
    /** Where the user manages the installation's repository access, or null when the provider has no such page. */
    installationSettingsUrl: (providerInstallationId: string) => string | null;
    /** GitHub predates the _APP_VCS_PROVIDERS variable, so it stays on unconditionally. */
    alwaysEnabled?: boolean;
    /** Gitea is a self-hosted-only feature, not offered on Appwrite Cloud. */
    selfHostedOnly?: boolean;
}

/**
 * Single source of truth for the console's git providers - icons, labels,
 * provider URLs and the authorize redirects. Key order is display order:
 * GitHub first, Origin second, then the rest.
 */
export const VCS_PROVIDERS: Record<VcsProviderId, VcsProviderMeta> = {
    github: {
        id: 'github',
        label: 'GitHub',
        icon: IconGithub,
        organizationUrl: (organization) => `https://github.com/${organization}`,
        installationSettingsUrl: (providerInstallationId) =>
            `https://github.com/settings/installations/${providerInstallationId}`,
        alwaysEnabled: true
    },
    origin: {
        id: 'origin',
        label: 'Origin',
        icon: IconOrigin as unknown as ComponentType,
        // Origin repositories are browsed in the Codebase section of cursor.com
        organizationUrl: () => 'https://cursor.com/codebase',
        installationSettingsUrl: () => 'https://cursor.com/codebase/settings/apps'
    },
    gitea: {
        id: 'gitea',
        label: 'Gitea',
        icon: IconGitea as unknown as ComponentType,
        // The Gitea host is per-deployment server configuration the client does not know
        organizationUrl: () => '',
        installationSettingsUrl: () => null,
        selfHostedOnly: true
    }
};

/** Provider metadata with a GitHub fallback for unknown ids (cosmetic use only). */
export function getVcsProvider(provider?: string): VcsProviderMeta {
    return VCS_PROVIDERS[provider as VcsProviderId] ?? VCS_PROVIDERS.github;
}

/**
 * Providers the connect UI should offer, honoring the server's
 * _APP_VCS_PROVIDERS list and each provider's own gates.
 */
export function enabledVcsProviders(vcsProviders: string[] | undefined): VcsProviderMeta[] {
    return Object.values(VCS_PROVIDERS).filter(
        (provider) =>
            provider.alwaysEnabled ||
            ((vcsProviders?.includes(provider.id) ?? false) &&
                (!provider.selfHostedOnly || isSelfHosted))
    );
}

/**
 * Whether the console can create repositories on the provider. Servers that
 * predate _APP_VCS_PROVIDERS_WITH_REPOSITORY_CREATION omit the list; keep the
 * console's historical behavior (creation offered) for them.
 */
export function supportsRepositoryCreation(
    provider: string,
    variables: Models.ConsoleVariables
): boolean {
    return variables?._APP_VCS_PROVIDERS_WITH_REPOSITORY_CREATION?.includes(provider) ?? true;
}

/**
 * Whether the provider can host public repositories. When it cannot, every
 * repository is private and the public/private choice is meaningless.
 */
export function supportsPublicRepositories(
    provider: string,
    variables: Models.ConsoleVariables
): boolean {
    return variables?._APP_VCS_PROVIDERS_WITH_PUBLIC_REPOSITORIES?.includes(provider) ?? true;
}

export function connectVcsProvider(provider: string, callbackState: Record<string, string> = null) {
    const redirect = new URL(page.url);
    if (callbackState) {
        Object.keys(callbackState).forEach((key) => {
            redirect.searchParams.append(key, callbackState[key]);
        });
    }
    const target = new URL(`${getApiEndpoint(page.params.region)}/vcs/${provider}/authorize`);
    target.searchParams.set('project', page.params.project);
    target.searchParams.set('success', redirect.toString());
    target.searchParams.set('failure', redirect.toString());
    target.searchParams.set('mode', 'admin');
    return target;
}

export function connectGitHub(callbackState: Record<string, string> = null) {
    return connectVcsProvider('github', callbackState);
}

export function connectGitea(callbackState: Record<string, string> = null) {
    return connectVcsProvider('gitea', callbackState);
}

export function connectOrigin(callbackState: Record<string, string> = null) {
    return connectVcsProvider('origin', callbackState);
}

/**
 * Browser URL of an owner/organization on the provider. Unknown providers
 * fall back to GitHub, matching the console's historical behavior.
 */
export function getProviderOrganizationUrl(provider: string, organization: string): string {
    return getVcsProvider(provider).organizationUrl(organization);
}

/**
 * Browser URL of a repository on the provider, or '' when the provider's host
 * is not knowable client-side. Callers must not render a link for ''; an empty
 * or relative href would resolve against the console's own origin.
 */
export function getProviderRepositoryUrl(provider: string, organization: string, name: string) {
    const organizationUrl = getProviderOrganizationUrl(provider, organization);
    return organizationUrl ? `${organizationUrl}/${name}` : '';
}

export function deploymentStatusConverter(status: string) {
    // Status component possible values - status: 'waiting' | 'ready' | 'processing' | 'pending' | 'failed' | 'complete';
    switch (status) {
        case 'ready':
            return 'ready';
        case 'processing':
            return 'processing';
        case 'building':
            return 'pending';
        case 'waiting':
            return 'waiting';
        case 'queued':
            return 'waiting';
        case 'cancelled':
            return 'processing';
        case 'failed':
            return 'failed';
        default:
            return 'processing';
    }
}
