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

export const load: PageLoad = async ({ depends, url, route }) => {
    depends(Dependencies.DOMAINS);
    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);
    const query = getQuery(url);
    const search = getSearch(url);

    const parsedQueries = queryParamToMap(query || '[]');
    queries.set(parsedQueries);

    return {
        rules: await sdk.forProject.proxy.listRules(
            [Query.equal('type', RuleType.API), Query.equal('trigger', RuleTrigger.MANUAL)],
            search || undefined
        ),
        offset,
        limit,
        query,
        search,
        create: url.searchParams.get('create') !== null //TODO: port logic to new wizards
    };
};
