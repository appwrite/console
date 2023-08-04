import { Query } from '@aw-labs/appwrite-console';
import { sdk } from '$lib/stores/sdk';
import { pageToOffset } from '$lib/helpers/load';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends, url }) => {
    depends(Dependencies.FILES);
    const page = Number(params.page);
    const offset = pageToOffset(page, PAGE_LIMIT);
    const search = url.search.slice(1) ?? undefined;

    return {
        offset,
        search,
        files: await sdk.forProject.storage.listFiles(
            params.bucket,
            [Query.limit(PAGE_LIMIT), Query.offset(offset)],
            search
        )
    };
};
