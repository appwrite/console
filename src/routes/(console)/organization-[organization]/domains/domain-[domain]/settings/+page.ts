import { isCloud } from '$lib/system';
import { redirect } from '@sveltejs/kit';
import { base, resolve } from '$app/paths';
import { Dependencies } from '$lib/constants';
import type { Models } from '@appwrite.io/console';
import { getTeamOrOrganizationList } from '$lib/stores/organization';

export const load = async ({ params, parent, depends }) => {
    if (!isCloud) {
        redirect(
            303,
            resolve('/(console)/organization-[organization]', {
                organization: params.organization
            })
        );
    }

    depends(Dependencies.DOMAINS);

    const { domain } = await parent();

    const organizations = (await getTeamOrOrganizationList()) as Models.OrganizationList;

    return {
        domain,
        organizations
    };
};
