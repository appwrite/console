import { Query } from '@appwrite.io/console';
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
        sdk.forProject(params.region, params.project).sites.listDeployments({
            siteId: params.site,
            queries: [
                Query.limit(limit),
                Query.offset(offset),
                Query.orderDesc(''),
                Query.select([
                    'buildSize',
                    'sourceSize',
                    'totalSize',
                    'buildDuration',
                    'status',
                    'type',
                    'resourceId'
                ]),
                ...parsedQueries.values()
            ]
        }),
        sdk.forProject(params.region, params.project).vcs.listInstallations()
    ]);

    return {
        offset,
        limit,
        query,
        deploymentList,
        activeDeployment:
            site.deploymentId && deploymentList?.total
                ? await sdk
                      .forProject(params.region, params.project)
                      .sites.getDeployment({ siteId: params.site, deploymentId: site.deploymentId })
                : null,
        installations
    };
};
