import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getQuery, pageToOffset } from '$lib/helpers/load';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';
import { queries, queryParamToMap } from '$lib/components/filters';

export const load: PageLoad = async ({ params, depends, url, route, parent }) => {
    const data = await parent();
    depends(Dependencies.DEPLOYMENTS);
    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);
    const query = getQuery(url);

    const parsedQueries = queryParamToMap(query || '[]');
    queries.set(parsedQueries);
    let activeDeployment = null;
    if (data.function.deploymentId) {
        try {
            activeDeployment = await sdk
                .forProject(params.region, params.project)
                .functions.getDeployment({
                    functionId: params.function,
                    deploymentId: data.function.deploymentId
                });
        } catch (error) {
            // active deployment with the requested ID could not be found
            activeDeployment = null;
        }
    }

    return {
        offset,
        limit,
        query,
        installations: data.installations,
        activeDeployment,
        deploymentList: await sdk
            .forProject(params.region, params.project)
            .functions.listDeployments({
                functionId: params.function,
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
            })
    };
};
