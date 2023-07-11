import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';
import { CARD_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, route }) => {
    const page = getPage(url);
    const limit = getLimit(url, route, CARD_LIMIT);
    const offset = pageToOffset(page, limit);

    return {
        offset,
        limit,
        projects: await sdk.forConsole.projects.list([
            Query.offset(offset),
            Query.limit(limit),
            Query.equal('teamId', params.organization),
            Query.orderDesc('$createdAt')
        ]),
        streamed: {
            // We nest these so that layout doesn't have to wait for these promises to load
            projects: sdk.forConsole.projects.list([
                Query.equal('teamId', params.organization),
                Query.orderDesc('$createdAt')
            ])
        }
    };
};
