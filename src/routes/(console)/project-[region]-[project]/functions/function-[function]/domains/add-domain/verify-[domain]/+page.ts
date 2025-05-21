import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants.js';
import { isCloud } from '$lib/system';
import type { Domain, DomainsList } from '$lib/sdk/domains.js';

export const load = async ({ depends, params }) => {
    depends(Dependencies.DOMAINS);

    let domain: Domain;
    let domainsList: DomainsList;
    if (isCloud) {
        domainsList = await sdk.forConsole.domains.list();
        const domainId = domainsList.domains.find(
            (domain: Domain) => domain.domain === params.domain
        ).$id;
        domain = await sdk.forConsole.domains.get(domainId);
    }

    return {
        domain,
        domainsList
    };
};
