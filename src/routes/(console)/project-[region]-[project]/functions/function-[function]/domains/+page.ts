import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getQuery, getSearch, pageToOffset } from '$lib/helpers/load';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { queries, queryParamToMap } from '$lib/components/filters';
import { fetchOrganizationDomainsForRules } from '$lib/helpers/domains';
import { RuleType, DeploymentResourceType, RuleTrigger } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, params, url, route, parent }) => {
    depends(Dependencies.FUNCTION_DOMAINS);
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
            Query.equal('deploymentResourceType', DeploymentResourceType.FUNCTION),
            Query.equal('deploymentResourceId', params.function),
            Query.equal('trigger', RuleTrigger.MANUAL),
            Query.limit(limit),
            Query.offset(offset),
            Query.orderDesc('$updatedAt'),
            ...parsedQueries.values()
        ],
        search: search || undefined
    });

    const organizationDomains = await fetchOrganizationDomainsForRules(
        proxyRules,
        organization.$id
    );

    return {
        offset,
        limit,
        query,
        search,
        proxyRules,
        organizationDomains
    };
};
