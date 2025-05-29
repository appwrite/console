import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import { Dependencies } from '$lib/constants.js';
import type { Models } from '@appwrite.io/console';

export const load = async ({ parent, depends }) => {
    const { site } = await parent();
    depends(Dependencies.SITES_DOMAINS);

    let domainsList: Models.DomainsList;

    if (isCloud) {
        domainsList = await sdk.forConsole.domains.list();
    }

    return {
        site,
        domainsList
    };
};
