import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { flags } from '$lib/flags';
import { getLimit, getPage, getSearch, pageToOffset } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, params, route, depends, parent }) => {
    const { account, organization } = await parent();
    depends(Dependencies.ORGANIZATION);
    depends(Dependencies.MEMBERS);

    const page = getPage(url);
    const search = getSearch(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);

    const supportsProjectRoles = flags.granularProjectAccess({ account, organization });

    const [organizationMembers, orgProjects] = await Promise.all([
        sdk.forConsole.teams.listMemberships({
            teamId: params.organization,
            queries: [Query.limit(limit), Query.offset(offset)],
            search
        }),
        supportsProjectRoles
            ? sdk.forConsole
                  .organization(params.organization)
                  .listProjects({
                      queries: [Query.limit(100), Query.equal('teamId', params.organization)]
                  })
                  .catch(() => null)
            : null
    ]);

    return {
        offset,
        limit,
        search,
        organizationMembers,
        orgProjects
    };
};
