import { page } from '$app/state';
import { getApiEndpoint } from './sdk';

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
 * Browser URL of an owner/organization on the provider. Origin repositories
 * are browsed in the Codebase section of cursor.com.
 */
export function getProviderOrganizationUrl(provider: string, organization: string): string {
    switch (provider) {
        case 'origin':
            return `https://cursor.com/codebase/${organization}`;
        default:
            return `https://github.com/${organization}`;
    }
}

/**
 * Browser URL of a repository on the provider.
 */
export function getProviderRepositoryUrl(provider: string, organization: string, name: string) {
    return `${getProviderOrganizationUrl(provider, organization)}/${name}`;
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
