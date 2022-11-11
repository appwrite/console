import { Query } from '@aw-labs/appwrite-console';
import { sdkForConsole } from '$lib/stores/sdk';
import { pageToOffset } from '$lib/helpers/load';
import { PAGE_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const page = Number(params.page);
    const offset = pageToOffset(page, PAGE_LIMIT);

    return {
        offset,
        logs: await sdkForConsole.account.listLogs([Query.offset(offset), Query.limit(PAGE_LIMIT)])
    };
};
