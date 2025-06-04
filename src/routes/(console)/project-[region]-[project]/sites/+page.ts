import { Query, type Models } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getSearch, getView, pageToOffset, View } from '$lib/helpers/load';
import { CARD_LIMIT, Dependencies } from '$lib/constants';
import { flags } from '$lib/flags';

export const load = async ({ url, depends, route, params }) => {
    depends(Dependencies.SITES);
    const page = getPage(url);
    const search = getSearch(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);
    const view = getView(url, route, View.Grid, View.Grid);

    if (!flags.showSites) {
        return {
            sitesLive: false,
            offset,
            limit,
            search,
            view,
            siteList: {
                total: 0,
                sites: []
            } as Models.SiteList
        };
    }

    const siteList = await sdk
        .forProject(params.region, params.project)
        .sites.list(
            [Query.limit(limit), Query.offset(offset), Query.orderDesc('')],
            search || undefined
        );

    return {
        sitesLive: true,
        offset,
        limit,
        search,
        siteList,
        view
    };
};
