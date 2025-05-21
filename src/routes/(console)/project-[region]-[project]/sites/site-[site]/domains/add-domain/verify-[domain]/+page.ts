import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import { Dependencies } from '$lib/constants.js';
import type { Domain, DomainsList } from '$lib/sdk/domains.js';

export const load = async ({ parent, depends, params }) => {
    const { site } = await parent();
    depends(Dependencies.SITES_DOMAINS);

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
        site,
        domain,
        domainsList
    };
};
