import { base } from '$app/paths';
import { page } from '$app/state';
import { get } from 'svelte/store';
import { sdk } from '$lib/stores/sdk';
import type { Models } from '@appwrite.io/console';
import { projectRegion } from '$routes/(console)/project-[region]-[project]/store';

/**
 * Returns the current project ID.
 *
 * The function first checks for a `project` parameter in the Svelte `page` store.
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
    const projectFromParams = page?.params?.project;
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

/**
 * A minimal project shape with -
 * 1. `$id` and
 * 2. optional `region`.
 *
 * Compatible with full `Models.Project`.
 */
type CompatibleProjectInstance =
    | Models.Project
    | {
          $id: string;
          region?: string;
      };

/**
 * Generates the project route URL, optionally using a custom project and/or path.
 * Falls back to the current route's project and region if not provided.
 *
 * @param projectOrPath Either a project object or a path string (e.g., "/databases").
 * @param maybePath Optional path string if the first argument is a project.
 *
 * @returns Project route URL (e.g., "/project-fra-console/databases").
 */
export function getProjectRoute(
    projectOrPath?: string | CompatibleProjectInstance,
    maybePath?: string
): string {
    let withPath: string | undefined;
    let projectInstance: CompatibleProjectInstance | undefined;

    if (typeof projectOrPath === 'string') {
        withPath = projectOrPath;
        projectInstance = undefined;
    } else {
        withPath = maybePath;
        projectInstance = projectOrPath;
    }

    const projectId = projectInstance?.$id ?? page?.params?.project;
    const projectRegion = projectInstance?.region ?? page?.params?.region ?? 'default';
    const suffix = withPath?.trim() ? (withPath.startsWith('/') ? withPath : `/${withPath}`) : '';

    return `${base}/project-${projectRegion}-${projectId}${suffix}`;
}
