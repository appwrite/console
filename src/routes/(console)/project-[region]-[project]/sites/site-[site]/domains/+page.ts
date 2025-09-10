import { Query } from '@appwrite.io/console';
import { RuleTrigger, sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getQuery, getSearch, pageToOffset } from '$lib/helpers/load';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { queries, queryParamToMap } from '$lib/components/filters';
import { RuleType } from '$lib/stores/sdk';
import { DeploymentResourceType } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';

export const load = async ({ params, depends, url, route, parent }) => {
    depends(Dependencies.SITES_DOMAINS);
    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);
    const query = getQuery(url);
    const search = getSearch(url);

    const parsedQueries = queryParamToMap(query || '[]');
    queries.set(parsedQueries);

    const { organization } = await parent();

    const proxyRules = await sdk.forProject(params.region, params.project).proxy.listRules({
        queries: [
            Query.equal('type', [RuleType.DEPLOYMENT, RuleType.REDIRECT]),
            Query.equal('deploymentResourceType', DeploymentResourceType.SITE),
            Query.equal('deploymentResourceId', params.site),
            Query.equal('trigger', RuleTrigger.MANUAL),
            Query.limit(limit),
            Query.offset(offset),
            Query.orderDesc(''),
            ...parsedQueries.values()
        ],
        search: search || undefined
    });

    // Only load organization domains if we have rules and are on Cloud
    const organizationDomains =
        isCloud && proxyRules.total > 0
            ? await sdk.forConsole.domains.list({
                  queries: [Query.equal('teamId', organization.$id)]
              })
            : null;

    return {
        offset,
        limit,
        query,
        search,
        proxyRules,
        organizationDomains
    };
};
