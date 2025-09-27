import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getQuery, getSearch, pageToOffset } from '$lib/helpers/load';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { queries, queryParamToMap } from '$lib/components/filters';
import { fetchOrganizationDomainsForRules } from '$lib/helpers/domains';
import { RuleType, RuleTrigger } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, url, route, params, parent }) => {
    depends(Dependencies.DOMAINS);
    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);
    const query = getQuery(url);
    const search = getSearch(url);

    const parsedQueries = queryParamToMap(query || '[]');
    queries.set(parsedQueries);

    const { organization } = await parent();

    const rules = await sdk.forProject(params.region, params.project).proxy.listRules({
        queries: [Query.equal('type', RuleType.API), Query.equal('trigger', RuleTrigger.MANUAL)],
        search: search || undefined
    });

    const organizationDomains = await fetchOrganizationDomainsForRules(rules, organization.$id);

    return {
        rules,
        offset,
        limit,
        query,
        search,
        organizationDomains,
        create: url.searchParams.get('create') !== null //TODO: port logic to new wizards
    };
};
