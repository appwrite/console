import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT, Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, url, route, depends, parent }) => {
    const { scopes } = await parent();
    depends(Dependencies.ORGANIZATION);
    const page = getPage(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);
    if (!scopes.includes('projects.read') && scopes.includes('billing.read')) {
        return redirect(301, `/console/organization-${params.organization}/billing`);
    }

    const projects = await sdk.forConsole.projects.list([
        Query.offset(offset),
        Query.equal('teamId', params.organization),
        Query.limit(limit),
        Query.orderDesc('')
    ]);

    // set `default` or something else,
    // `undefined` in the url looks really off!
    for (const project of projects.projects) {
        project.region ??= 'default';
    }

    return {
        offset,
        limit,
        projects
    };
};
