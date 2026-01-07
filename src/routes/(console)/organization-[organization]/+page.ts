import { Query } from '@appwrite.io/console';
import { isCloud } from '$lib/system';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getSearch, pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT, Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';

export const load: PageLoad = async ({ params, url, route, depends, parent }) => {
    const { scopes } = await parent();
    if (!scopes.includes('projects.read') && scopes.includes('billing.read')) {
        return redirect(301, `${base}/organization-${params.organization}/billing`);
    }

    depends(Dependencies.ORGANIZATION);

    const page = getPage(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);
    const search = getSearch(url);

    const archivedPageRaw = parseInt(url.searchParams.get('archivedPage') || '1', 10);
    const archivedPage =
        Number.isFinite(archivedPageRaw) && archivedPageRaw > 0 ? archivedPageRaw : 1;
    const archivedOffset = pageToOffset(archivedPage, limit);

    const searchQueries = search
        ? [Query.or([Query.search('search', search), Query.contains('labels', search)])]
        : [];
    const commonQueries = [Query.equal('teamId', params.organization)];
    const activeQueries = isCloud
        ? [Query.or([Query.equal('status', 'active'), Query.isNull('status')])]
        : [];

    const [activeProjects, archivedProjects, activeTotal, archivedTotal] = await Promise.all([
        sdk.forConsole.projects.list({
            queries: [
                Query.offset(offset),
                Query.limit(limit),
                Query.orderDesc(''),
                ...commonQueries,
                ...searchQueries,
                ...activeQueries
            ]
        }),
        isCloud
            ? sdk.forConsole.projects.list({
                  queries: [
                      Query.offset(archivedOffset),
                      Query.limit(limit),
                      Query.orderDesc(''),
                      ...commonQueries,
                      ...searchQueries,
                      Query.equal('status', 'archived')
                  ]
              })
            : Promise.resolve({ projects: [], total: 0 }),
        sdk.forConsole.projects.list({
            queries: [...commonQueries, ...activeQueries, ...searchQueries]
        }),
        isCloud
            ? sdk.forConsole.projects.list({
                  queries: [...commonQueries, ...searchQueries, Query.equal('status', 'archived')]
              })
            : Promise.resolve({ projects: [], total: 0 })
    ]);

    // set `default` if no region!
    for (const project of activeProjects.projects) {
        project.region ??= 'default';
    }
    if (isCloud) {
        for (const project of archivedProjects.projects) {
            project.region ??= 'default';
        }
    }

    return {
        offset,
        limit,
        projects: {
            ...activeProjects,
            projects: activeProjects.projects,
            total: activeTotal.total
        },
        activeProjectsPage: activeProjects.projects,
        archivedProjectsPage: archivedProjects.projects,
        activeTotalOverall: activeTotal.total,
        archivedTotalOverall: archivedTotal.total,
        archivedOffset,
        archivedPage,
        search
    };
};
