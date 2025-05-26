import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getSearch, getView, pageToOffset, View } from '$lib/helpers/load';
import { CARD_LIMIT, Dependencies } from '$lib/constants';
import { APPWRITE_OFFICIALS_ORG, isCloud } from '$lib/system';
import { organization } from '$lib/stores/organization';
import { get } from 'svelte/store';

export const load = async ({ url, depends, route, params }) => {
    // don't load anything on cloud unless org is appwrite atm!
    if (isCloud && get(organization)?.$id !== APPWRITE_OFFICIALS_ORG) {
        return;
    }

    depends(Dependencies.SITES);

    const page = getPage(url);
    const search = getSearch(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);
    const view = getView(url, route, View.Grid, View.Grid);

    const siteList = await sdk
        .forProject(params.region, params.project)
        .sites.list(
            [Query.limit(limit), Query.offset(offset), Query.orderDesc('')],
            search || undefined
        );

    return {
        offset,
        limit,
        search,
        siteList,
        view
    };
};
