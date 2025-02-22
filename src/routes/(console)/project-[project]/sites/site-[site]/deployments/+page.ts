import { type Models, Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getQuery, pageToOffset } from '$lib/helpers/load';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { queries, queryParamToMap } from '$lib/components/filters';

export const load = async ({ params, depends, url, route, parent }) => {
    const { site } = await parent();
    depends(Dependencies.DEPLOYMENTS);
    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);
    const query = getQuery(url);

    const parsedQueries = queryParamToMap(query || '[]');
    queries.set(parsedQueries);

    const [deploymentList, installations] = await Promise.all([
        sdk.forProject.sites.listDeployments(params.site, [
            Query.limit(limit),
            Query.offset(offset),
            Query.orderDesc(''),
            ...parsedQueries.values()
        ]),
        sdk.forProject.vcs.listInstallations()
    ]);

    // TODO: @Meldiron check on backend.
    // if the only deployment of the site was deleted, the document isn't updated,
    // and it still refers an old deployment throwing a 404 on overview & deployments page!
    let activeDeployment: Models.Deployment | null;

    try {
        activeDeployment =
            site.deploymentId && deploymentList?.total
                ? await sdk.forProject.sites.getDeployment(params.site, site.deploymentId)
                : null;
    } catch (error) {
        activeDeployment = null;
    }

    return {
        limit,
        query,
        offset,
        installations,
        deploymentList,
        activeDeployment,
    };
};
