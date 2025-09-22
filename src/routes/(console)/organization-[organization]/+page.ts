import { Query } from '@appwrite.io/console';
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
};
