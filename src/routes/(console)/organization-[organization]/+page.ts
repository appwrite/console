import { Query } from '@appwrite.io/console';
import { isCloud } from '$lib/system';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getSearch, pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT, Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { isProjectSpecificRole, parseProjectRole } from '$lib/stores/billing';

export const load: PageLoad = async ({ params, url, route, depends, parent }) => {
    const { scopes, roles } = await parent();
    if (!scopes.includes('projects.read') && scopes.includes('billing.read')) {
        return redirect(
            301,
            resolve('/(console)/organization-[organization]/billing', {
                organization: params.organization
            })
        );
    }

    depends(Dependencies.ORGANIZATION);

    const page = getPage(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);
    const search = getSearch(url);

    // For members with project-specific roles, only show the projects they have access to.
    // Org-level roles (owner, developer, etc.) see all projects as normal.
    const projectSpecificIds = isCloud
        ? roles
              .filter(isProjectSpecificRole)
              .map((r) => parseProjectRole(r)?.projectId)
              .filter(Boolean)
        : [];
    const hasProjectSpecificRoles = projectSpecificIds.length > 0;

    const searchQueries = search
        ? [Query.or([Query.search('search', search), Query.contains('labels', search)])]
        : [];
    const activeQueries = isCloud
        ? [Query.or([Query.equal('status', ['active', 'paused']), Query.isNull('status')])]
        : [];
    const projectScopeQueries = hasProjectSpecificRoles
        ? [Query.equal('$id', projectSpecificIds as string[])]
        : [];

    const activeProjects = await sdk.forConsole.organization(params.organization).listProjects({
        queries: [
            ...searchQueries,
            ...activeQueries,
            ...projectScopeQueries,
            Query.offset(offset),
            Query.limit(limit),
            Query.orderDesc(''),
            Query.equal('teamId', params.organization)
        ]
    });

    const projects = await Promise.all(
        activeProjects.projects.map(async (project) => {
            project.region ??= 'default';
            const platformList = await sdk
                .forProject(project.region, project.$id)
                .project.listPlatforms({ queries: [Query.limit(3)] })
                .catch(() => ({ platforms: [], total: 0 }));

            return {
                ...project,
                platforms: platformList.platforms,
                platformsTotal: platformList.total
            };
        })
    );

    return {
        limit,
        offset,
        search,
        projects: {
            ...activeProjects,
            projects
        }
    };
};
