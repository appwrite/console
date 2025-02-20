import { queries, queryParamToMap } from '$lib/components/filters';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { getLimit, getPage, getQuery, pageToOffset } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import { Query, type Models } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, route, depends }) => {
    depends(Dependencies.USER_TARGETS);

    const page = getPage(url);
    const limit = getLimit(params.project, url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);
    const query = getQuery(url);

    const parsedQueries = queryParamToMap(query || '[]');
    queries.set(parsedQueries);

    const targets = await sdk
        .forProject(params.region, params.project)
        .users.listTargets(params.user, [
            Query.limit(limit),
            Query.offset(offset),
            Query.orderDesc(''),
            ...parsedQueries.values()
        ]);

    const promisesById: Record<string, Promise<Models.Provider>> = {};
    targets.targets.forEach((target) => {
        if (target.providerId && !promisesById[target.providerId]) {
            promisesById[target.providerId] = sdk
                .forProject(params.region, params.project)
                .messaging.getProvider(target.providerId);
        }
    });

    const providersById: Record<string, Models.Provider> = {};
    const resolved = await Promise.allSettled(Object.values(promisesById));
    resolved.forEach((result) => {
        if (result.status === 'fulfilled') {
            const provider = result.value;
            providersById[provider.$id] = provider;
        }
    });

    return {
        offset,
        limit,
        query,
        targets,
        providersById
    };
};
