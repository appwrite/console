import type { PageLoad } from './$types';
import Header from '$routes/(console)/project-[region]-[project]/auth/user-[user]/header.svelte';
import { base } from '$app/paths';
import { sdk } from '$lib/stores/sdk';
import { queries, queryParamToMap } from '$lib/components/filters';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { getLimit, getPage, getQuery, pageToOffset } from '$lib/helpers/load';
import { Query, type Models } from '@appwrite.io/console';

export const load: PageLoad = async ({ params, url, route, depends }) => {
    depends(Dependencies.USER_TARGETS);

    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);
    const query = getQuery(url);

    const parsedQueries = queryParamToMap(query || '[]');
    queries.set(parsedQueries);

    const [user, targets] = await Promise.all([
        sdk.forProject(params.region, params.project).users.get(params.user),
        sdk.forProject(params.region, params.project).users.listTargets({
            userId: params.user,
            queries: [
                Query.limit(limit),
                Query.offset(offset),
                Query.orderDesc(''),
                ...parsedQueries.values()
            ]
        })
    ]);

    const promisesById: Record<string, Promise<Models.Provider>> = {};
    targets.targets.forEach((target) => {
        if (target.providerId && !promisesById[target.providerId]) {
            promisesById[target.providerId] = sdk
                .forProject(params.region, params.project)
                .messaging.getProvider({ providerId: target.providerId });
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
        header: Header,
        back: `${base}/embed/project-${params.region}-${params.project}/auth`,
        path: `${base}/embed/project-${params.region}-${params.project}/auth/user-${params.user}`,
        user,
        offset,
        limit,
        query,
        targets,
        providersById
    };
};
