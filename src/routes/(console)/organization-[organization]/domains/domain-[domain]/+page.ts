import { PAGE_LIMIT } from '$lib/constants';
import { Dependencies } from '$lib/constants';
import { pageToOffset } from '$lib/helpers/load';
import { getLimit } from '$lib/helpers/load';
import { getPage } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk.js';
import { Query } from '@appwrite.io/console';

export const load = async ({ parent, depends, url, route }) => {
    depends(Dependencies.DOMAIN);

    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);
    const { domain } = await parent();

    return {
        domain,
        recordList: await sdk.forConsole.domains.listRecords(domain.$id, [
            Query.offset(offset),
            Query.limit(limit)
        ]),
        offset,
        limit
    };
};
