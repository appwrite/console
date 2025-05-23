import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import { Dependencies } from '$lib/constants.js';
import type { DomainsList } from '$lib/sdk/domains';

export const load = async ({ parent, depends }) => {
    const { site } = await parent();
    depends(Dependencies.SITES_DOMAINS);

    let domainsList: DomainsList;

    if (isCloud) {
        domainsList = await sdk.forConsole.domains.list();
    }

    return {
        site,
        domainsList
    };
};
