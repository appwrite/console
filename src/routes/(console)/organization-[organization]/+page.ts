import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getSearch, pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT, Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import { isCloud } from '$lib/system';

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

    if (isCloud) {
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
                    Query.equal('teamId', params.organization),
                    Query.equal('status', 'archived'),
                    Query.limit(1000)
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
            search
        };
    } else {
        const projects = await sdk.forConsole.projects.list({
            queries: [
                Query.offset(offset),
                Query.equal('teamId', params.organization),
                Query.limit(limit),
                Query.orderDesc('')
            ],
            search: search || undefined
        });

        // set `default` if no region!
        for (const project of projects.projects) {
            project.region ??= 'default';
        }

        return {
            offset,
            limit,
            projects,
            search
        };
    }
};
