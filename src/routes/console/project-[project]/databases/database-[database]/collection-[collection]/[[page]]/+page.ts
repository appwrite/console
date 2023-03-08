import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { pageToOffset } from '$lib/helpers/load';
import { sdkForProject } from '$lib/stores/sdk';
import { Query } from '@aw-labs/appwrite-console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends }) => {
    depends(Dependencies.DOCUMENTS);
    const page = Number(params.page);
    const offset = pageToOffset(page, PAGE_LIMIT);

    return {
        offset,
        documents: await sdkForProject.databases.listDocuments(params.database, params.collection, [
            Query.limit(PAGE_LIMIT),
            Query.offset(offset),
            Query.orderDesc('$createdAt')
        ])
    };
};
