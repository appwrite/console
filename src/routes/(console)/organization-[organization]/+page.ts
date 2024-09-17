import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT, Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { canSeeProjects } from '$lib/stores/roles';
import { get } from 'svelte/store';

export const load: PageLoad = async ({ params, url, route, depends, parent }) => {
    await parent();
    depends(Dependencies.ORGANIZATION);
    const page = getPage(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);

    if (!get(canSeeProjects)) {
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
