import { Query } from '@appwrite.io/console';
import { sdkForProject } from '$lib/stores/sdk';
import { pageToOffset } from '$lib/helpers/load';
import { PAGE_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
    await parent();
    const page = Number(params.page);
    const offset = pageToOffset(page, PAGE_LIMIT);

    return {
        offset,
        logs: await sdkForProject.teams.listLogs(params.team, [
            Query.limit(PAGE_LIMIT),
            Query.offset(offset)
        ])
    };
};
