import { memberList } from '$lib/stores/organization';
import { Query } from '@aw-labs/appwrite-console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, parent }) => {
    await parent();
    let page = Number(params.page);
    let offset = page ? page * 5 - 5 : 0;
    await memberList.load(params.organization, [Query.limit(5), Query.offset(offset)]);
    return;
};
