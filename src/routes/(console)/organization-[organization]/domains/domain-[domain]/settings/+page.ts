import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import { Query } from '@appwrite.io/console';

export const load = async ({ parent, depends }) => {
    depends(Dependencies.DOMAINS);

    const organizations = !isCloud
        ? await sdk.forConsole.teams.list()
        : await sdk.forConsole.billing.listOrganization([Query.equal('platform', 'appwrite')]);

    const { domain } = await parent();
    return {
        domain,
        organizations
    };
};
