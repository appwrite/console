import { page } from '$app/state';
import { get } from 'svelte/store';
import { sdk } from '$lib/stores/sdk';
import { projectRegion } from '$routes/(console)/project-[region]-[project]/store';
import type { Models } from '@appwrite.io/console';
import { error } from '@sveltejs/kit';

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

export function isProjectBlocked(project: Models.Project | null | undefined): boolean {
    const hasGlobalProjectBlock = (project?.blocks ?? []).some((block) => {
        const type = block.resourceType?.trim().toLowerCase();
        const id = block.resourceId?.trim();

        // Global project block:
        // - legacy: both type and id empty
        // - new: resourceType === 'projects' with no specific resourceId
        const isLegacyGlobal = !type && !id;
        const isProjectsGlobal = type === 'projects' && !id;

        return isLegacyGlobal || isProjectsGlobal;
    });

    return project?.status !== 'paused' && hasGlobalProjectBlock;
}

export function isResourceBlocked(
    project: Models.Project | null | undefined,
    resourceType: string,
    resourceId: string
): boolean {
    const normalizedType = resourceType.trim().toLowerCase();
    const normalizedId = resourceId.trim();

    return (project?.blocks ?? []).some((block) => {
        const type = block.resourceType?.trim().toLowerCase();
        const id = block.resourceId?.trim();

        return type === normalizedType && id === normalizedId;
    });
}

export function guardResourceBlock(
    project: Models.Project | null | undefined,
    resourceType: string | string[],
    resourceId: string
) {
    const resourceTypes = Array.isArray(resourceType) ? resourceType : [resourceType];
    const isBlocked = resourceTypes.some((type) => isResourceBlocked(project, type, resourceId));

    if (isBlocked) {
        error(403, {
            type: 'general_resource_blocked',
            message: 'This resource page cannot be accessed.'
        });
    }
}
