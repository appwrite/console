import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getSearch, pageToOffset } from '$lib/helpers/load';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';
import { isCloud } from '$lib/system';
import type { OrganizationUsage } from '$lib/sdk/billing';
import { organization } from '$lib/stores/organization';
import { get } from 'svelte/store';

export const load: PageLoad = async ({ params, depends, url, route }) => {
    depends(Dependencies.FILES);
    const page = getPage(url);
    const search = getSearch(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);
    let oraganizationUsage: OrganizationUsage = null;
    if (isCloud && get(organization)) {
        oraganizationUsage = await sdk.forConsole.billing.listUsage(get(organization)?.$id);
    }

    return {
        offset,
        limit,
        search,
        files: await sdk.forProject.storage.listFiles(
            params.bucket,
            [Query.limit(limit), Query.offset(offset), Query.orderDesc('')],
            search
        ),
        oraganizationUsage
    };
};
