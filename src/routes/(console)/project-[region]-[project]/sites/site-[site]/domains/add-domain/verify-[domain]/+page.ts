import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import { Dependencies } from '$lib/constants.js';
import { type Models, Query } from '@appwrite.io/console';

export const load = async ({ parent, depends }) => {
    const { site, organization } = await parent();
    depends(Dependencies.SITES_DOMAINS);

    let domainsList: Models.DomainsList;
    if (isCloud) {
        domainsList = await sdk.forConsole.domains.list([Query.equal('teamId', organization.$id)]);
    }

    return {
        site,
        domainsList
    };
};
