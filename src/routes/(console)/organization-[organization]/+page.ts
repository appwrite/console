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
        ? [Query.or([Query.equal('status', 'active'), Query.isNull('status')])]
        : [];

    const activeProjects = await sdk.forConsole.projects.list({
        queries: [
            ...searchQueries,
            ...activeQueries,
            Query.offset(offset),
            Query.limit(limit),
            Query.orderDesc(''),
            Query.equal('teamId', params.organization)
        ]
    });

    // set `default` if no region!
    for (const project of activeProjects.projects) {
        project.region ??= 'default';
    }

    return {
        limit,
        offset,
        search,
        projects: activeProjects
    };
};
