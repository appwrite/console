import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { RuleTrigger, sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';
import { getSearch } from '$lib/helpers/load';
import { RuleType } from '$lib/stores/sdk';
import { queries } from '$lib/components/filters';
import { queryParamToMap } from '$lib/components/filters';
import { getQuery } from '$lib/helpers/load';
import { pageToOffset } from '$lib/helpers/load';
import { getLimit } from '$lib/helpers/load';
import { getPage } from '$lib/helpers/load';
import { isCloud } from '$lib/system';

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

    // Only load organization domains if we have rules and are on Cloud
    const organizationDomains =
        isCloud && rules.total > 0
            ? await sdk.forConsole.domains.list({
                  queries: [Query.equal('teamId', organization.$id)]
              })
            : null;

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
