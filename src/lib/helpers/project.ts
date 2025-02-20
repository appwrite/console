import { page } from '$app/stores';
import { get } from 'svelte/store';

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
 * - `/project-us-console/` → `console`
 */
export function getProjectId() {
    // safety check!
    const projectFromParams = get(page)?.params?.project;
    if (projectFromParams) {
        return projectFromParams;
    }

    const pathname = window.location.pathname + '/';
    const projectMatch = pathname.match(/\/project-(?:[a-z]{2,3}-)?([^/]+)/);

    return projectMatch?.[1] || null;
}
