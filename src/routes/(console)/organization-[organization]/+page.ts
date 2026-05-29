import { Query } from '@appwrite.io/console';
import { isCloud } from '$lib/system';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getSearch, pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT, Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

export const load: PageLoad = async ({ params, url, route, depends, parent }) => {
    const { scopes } = await parent();
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

    const searchQueries = search
        ? [Query.or([Query.search('search', search), Query.contains('labels', search)])]
        : [];
    const activeQueries = isCloud
        ? [Query.or([Query.equal('status', ['active', 'paused']), Query.isNull('status')])]
        : [];

    // Fetch all matching projects so we can filter inaccessible ones before paginating.
    // Most orgs have well under 100 projects; this avoids broken pagination from client-side
    // filtering of server-paginated results.
    const allProjectsResult = await sdk.forConsole.organization(params.organization).listProjects({
        queries: [
            ...searchQueries,
            ...activeQueries,
            Query.limit(100),
            Query.orderDesc(''),
            Query.equal('teamId', params.organization)
        ]
    });

    const enrichedResults = await Promise.all(
        allProjectsResult.projects.map(async (project) => {
            project.region ??= 'default';
            const platformList = await sdk
                .forProject(project.region, project.$id)
                .project.listPlatforms({ queries: [Query.limit(3)] })
                .catch(() => null);

            if (!platformList) return null;

            return {
                ...project,
                platforms: platformList.platforms,
                platformsTotal: platformList.total
            };
        })
    );

    const accessibleProjects = enrichedResults.filter((p) => p !== null);
    const total = accessibleProjects.length;
    const paginatedProjects = accessibleProjects.slice(offset, offset + limit);

    return {
        limit,
        offset,
        search,
        projects: {
            ...allProjectsResult,
            projects: paginatedProjects,
            total
        }
    };
};
