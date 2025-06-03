import { Dependencies } from '$lib/constants';
import { RuleType, DeploymentResourceType, RuleTrigger, sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import { getPage } from '$lib/helpers/load';
import { getLimit } from '$lib/helpers/load';
import { pageToOffset } from '$lib/helpers/load';
import { getQuery } from '$lib/helpers/load';
import { getSearch } from '$lib/helpers/load';
import { queries, queryParamToMap } from '$lib/components/filters';
import { PAGE_LIMIT } from '$lib/constants';

export const load: PageLoad = async ({ depends, params, url, route }) => {
    depends(Dependencies.FUNCTION_DOMAINS);
    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);
    const query = getQuery(url);
    const search = getSearch(url);

    const parsedQueries = queryParamToMap(query || '[]');
    queries.set(parsedQueries);

    return {
        offset,
        limit,
        query,
        search,
        proxyRules: await sdk
            .forProject(params.region, params.project)
            .proxy.listRules(
                [
                    Query.equal('type', [RuleType.DEPLOYMENT, RuleType.REDIRECT]),
                    Query.equal('deploymentResourceType', DeploymentResourceType.FUNCTION),
                    Query.equal('deploymentResourceId', params.function),
                    Query.equal('trigger', RuleTrigger.MANUAL),
                    Query.limit(limit),
                    Query.offset(offset),
                    Query.orderDesc(''),
                    ...parsedQueries.values()
                ],
                search || undefined
            )
    };
};
