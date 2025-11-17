import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import { Query } from '@appwrite.io/console';
import { resolvedProfile } from '$lib/profiles/index.svelte';

export const load = async ({ parent, depends }) => {
    depends(Dependencies.DOMAINS);

    const organizations = !isCloud
        ? await sdk.forConsole.teams.list()
        : await sdk.forConsole.billing.listOrganization([
              Query.equal('platform', resolvedProfile.organizationPlatform)
          ]);

    const { domain } = await parent();
    return {
        domain,
        organizations
    };
};
