import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getSearch, pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT, Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, url, route, depends, parent }) => {
    const { scopes } = await parent();
    if (!scopes.includes('projects.read') && scopes.includes('billing.read')) {
        return redirect(301, `/console/organization-${params.organization}/billing`);
    }

    depends(Dependencies.ORGANIZATION);

    const page = getPage(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);
    const search = getSearch(url);

    const archivedPageRaw = parseInt(url.searchParams.get('archivedPage') || '1', 10);
    const archivedPage = Number.isFinite(archivedPageRaw) && archivedPageRaw > 0 ? archivedPageRaw : 1;
    const archivedOffset = pageToOffset(archivedPage, limit);
    const [activeProjects, archivedProjects, activeTotal, archivedTotal] = await Promise.all([
        sdk.forConsole.projects.list({
            queries: [
                Query.offset(offset),
                Query.equal('teamId', params.organization),
                Query.or([Query.equal('status', 'active'), Query.isNull('status')]),
                Query.limit(limit),
                Query.orderDesc('')
            ],
            search: search || undefined
        }),
        sdk.forConsole.projects.list({
            queries: [
                Query.offset(archivedOffset),
                Query.equal('teamId', params.organization),
                Query.equal('status', 'archived'),
                Query.limit(limit),
                Query.orderDesc('')
            ],
            search: search || undefined
        }),
        sdk.forConsole.projects.list({
            queries: [
                Query.equal('teamId', params.organization),
                Query.or([Query.equal('status', 'active'), Query.isNull('status')])
            ],
            search: search || undefined
        }),
        sdk.forConsole.projects.list({
            queries: [
                Query.equal('teamId', params.organization),
                Query.equal('status', 'archived')
            ],
            search: search || undefined
        })
    ]);

    // set `default` if no region!
    for (const project of activeProjects.projects) {
        project.region ??= 'default';
    }
    for (const project of archivedProjects.projects) {
        project.region ??= 'default';
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
