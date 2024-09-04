import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT, Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, url, route, depends, parent }) => {
    const parentData = await parent();
    depends(Dependencies.ORGANIZATION);
    const page = getPage(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);

    if (!parentData.scopes.includes('projects.read')) {
        return redirect(301, `/console/organization-${params.organization}/billing`);
    }

    return {
        offset,
        limit,
        projects: await sdk.forConsole.projects.list([
            Query.offset(offset),
            Query.equal('teamId', params.organization),
            Query.limit(limit),
            Query.orderDesc('')
        ])
    };
};
