import { Query, type Models } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getSearch, getView, pageToOffset, View } from '$lib/helpers/load';
import { CARD_LIMIT, Dependencies } from '$lib/constants';

export const load = async ({ url, depends, route }) => {
    depends(Dependencies.SITES);

    const page = getPage(url);
    const search = getSearch(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);
    const view = getView(url, route, View.Grid, View.Grid);

    const siteList = await sdk.forProject.sites.list(
        [Query.limit(limit), Query.offset(offset), Query.orderDesc('')],
        search || undefined
    );

    // TODO: @Meldiron Discuss better solution for getting screnshot IDs
    const deployments: Models.Deployment[] = [];
    await Promise.all(
        siteList.sites.map(async (site) => {
            if (!site.deploymentId) {
                return;
            }

            // TODO: @Meldiron Tripple-check if this can ever happened
            // It happened to me but on QA that might have corrupted data
            try {
                const deployment = await sdk.forProject.sites.getDeployment(
                    site.$id,
                    site.deploymentId
                );
                deployments.push(deployment);
            } catch (err) {
                // Active deployment no longer available (deleted?)
                console.warn(err);
            }
        })
    );

    return {
        offset,
        limit,
        search,
        siteList,
        deployments,
        view
    };
};
