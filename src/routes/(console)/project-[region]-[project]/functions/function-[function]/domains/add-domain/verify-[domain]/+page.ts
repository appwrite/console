import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import { Dependencies } from '$lib/constants.js';
import type { DomainsList } from '$lib/sdk/domains.js';

export const load = async ({ depends }) => {
    depends(Dependencies.DOMAINS);

    let domainsList: DomainsList;
    if (isCloud) {
        domainsList = await sdk.forConsole.domains.list();
    }

    return {
        domainsList
    };
};
