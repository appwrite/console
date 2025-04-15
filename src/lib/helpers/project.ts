import { page } from '$app/stores';
import { get } from 'svelte/store';
import { sdk } from '$lib/stores/sdk';
import { projectRegion } from '$routes/(console)/project-[region]-[project]/store';

/**
 * Returns the current project ID.
 *
 * The function first checks for a `project` parameter in the Svelte `$page` store.
 * If not found, it extracts the project ID from the pathname.
 *
 * Supports:
 * - Legacy structure: `/project-{projectID}/`
 * - Multi-region structure: `/project-{region}-{projectID}/`
 *
 * Example:
 * - `/project-console/` → `console`
 * - `/project-fra-console/` → `console`
 * - `/project-nyc-console/` → `console`
 */
export function getProjectId(): string | null {
    // safety check!
    const projectFromParams = get(page)?.params?.project;
    if (projectFromParams) {
        return projectFromParams;
    }

    const pathname = window.location.pathname + '/';
    const projectMatch = pathname.match(/\/project-(?:[a-z]{2,3}-)?([^/]+)/);

    return projectMatch?.[1] || null;
}

/**
 * Returns the correct API endpoint for the project based on the current project region.
 *
 * @returns {string} The project-specific API endpoint.
 */
export function getProjectEndpoint(): string {
    const currentProjectRegion = get(projectRegion);
    const { protocol, hostname, href } = new URL(sdk.forConsole.client.config.endpoint);

    return currentProjectRegion ? `${protocol}//${currentProjectRegion.$id}.${hostname}/v1` : href;
}
