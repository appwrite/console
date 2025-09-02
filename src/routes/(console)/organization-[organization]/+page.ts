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

    const projects = await sdk.forConsole.projects.list({
        queries: [
            Query.offset(offset),
            Query.equal('teamId', params.organization),
            Query.limit(limit),
            Query.orderDesc('')
        ],
        search: search || undefined
    });

    let allProjects: typeof projects.projects = [];
    let fetchedCount = 0;
    const total = projects.total;

    while (fetchedCount < total) {
        const next = await sdk.forConsole.projects.list({
            queries: [
                Query.offset(fetchedCount),
                Query.equal('teamId', params.organization),
                Query.limit(limit),
                Query.orderDesc('')
            ],
            search: search || undefined
        });
        allProjects = allProjects.concat(next.projects);
        fetchedCount += next.projects.length;
        if (next.projects.length === 0) break;
    }

    const allActiveProjects = allProjects.filter((p) => p.status === 'active');
    const allArchivedProjects = allProjects.filter((p) => p.status !== 'active');

    const activeProjectsForPage = allActiveProjects.slice(offset, offset + limit);

    // set `default` if no region!
    for (const project of allProjects) {
        project.region ??= 'default';
    }

    return {
        offset,
        limit,
        projects: { ...projects, projects: allProjects, total: allActiveProjects.length },
        activeProjectsPage: activeProjectsForPage,
        archivedProjectsPage: allArchivedProjects,
        activeTotalOverall: allActiveProjects.length,
        search
    };
};
