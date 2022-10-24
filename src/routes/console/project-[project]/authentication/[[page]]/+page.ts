import { Query } from '@aw-labs/appwrite-console';
import type { PageLoad } from './$types';
import { usersList } from '../store';

export const load: PageLoad = async ({ params, url, parent }) => {
    await parent();
    const page = Number(params.page);
    const offset = page ? page * 5 - 5 : 0;
    const search = url.searchParams.get('search');
    await usersList.load(
        [Query.limit(5), Query.offset(offset), Query.orderDesc('$createdAt')],
        search ?? undefined
    );

    return;
};
