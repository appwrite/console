import { Query } from '@appwrite.io/console';
import { RuleTrigger, sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getQuery, getSearch, pageToOffset } from '$lib/helpers/load';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { queries, queryParamToMap } from '$lib/components/filters';
import { RuleType } from '$lib/stores/sdk';
import { DeploymentResourceType } from '$lib/stores/sdk';

export const load = async ({ params, depends, url, route }) => {
    depends(Dependencies.SITES_DOMAINS);
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
                    Query.or([
                        Query.and([
                            Query.equal('type', RuleType.REDIRECT),
                            Query.equal('trigger', RuleTrigger.MANUAL)
                        ]),
                        Query.and([
                            Query.equal('type', RuleType.DEPLOYMENT),
                            Query.equal('trigger', RuleTrigger.MANUAL),
                            Query.equal('deploymentResourceType', DeploymentResourceType.SITE),
                            Query.equal('deploymentResourceId', params.site)
                        ])
                    ]),
                    Query.limit(limit),
                    Query.offset(offset),
                    Query.orderDesc(''),
                    ...parsedQueries.values()
                ],
                search || undefined
            )
    };
};
