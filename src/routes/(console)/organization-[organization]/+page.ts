import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT, Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';

export const load: PageLoad = async ({ params, url, route, depends, parent }) => {
    const { scopes, account } = await parent();
    depends(Dependencies.ORGANIZATION);
    const page = getPage(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);
    if (!scopes.includes('projects.read') && scopes.includes('billing.read')) {
        return redirect(301, `${base}/organization-${params.organization}/billing`);
    }

    const projects = await sdk.forConsole.projects.list([
        Query.offset(offset),
        Query.equal('teamId', params.organization),
        Query.limit(limit),
        Query.orderDesc('')
    ]);

    const lastUpdatedProject = projects.projects.reduce((latest, project) => {
        return new Date(project.$updatedAt) > new Date(latest.$updatedAt) ? project : latest;
    });

    const isInternalLink = url.pathname.startsWith('/console/organization-');

    const accessedAt = new Date(account.accessedAt).getTime();
    const accessedYesterday = new Date().getTime() - accessedAt > 30 * 60 * 1000;

    if (lastUpdatedProject && accessedYesterday && !isInternalLink) {
        redirect(
            303,
            `${base}/project-${lastUpdatedProject.region}-${lastUpdatedProject.$id}/studio`
        );
    }

    // set `default` if no region!
    for (const project of projects.projects) {
        project.region ??= 'default';
    }

    return {
        offset,
        limit,
        projects
    };
};
