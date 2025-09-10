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

    const records = await sdk.forConsole.domains.listRecords({
        domainId: domain.$id,
        queries: [Query.offset(offset), Query.limit(limit)]
    });

    records.dnsRecords = records.dnsRecords.sort((a, b) => {
        return (
            Number(b.lock) - Number(a.lock) || Date.parse(b.$createdAt) - Date.parse(a.$createdAt)
        );
    });

    return {
        limit,
        offset,
        domain,
        recordList: records,
    };
};
