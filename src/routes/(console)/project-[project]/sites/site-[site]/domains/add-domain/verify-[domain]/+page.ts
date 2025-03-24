import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants.js';
import { isCloud } from '$lib/system';
import type { Domain, DomainsList } from '$lib/sdk/domains.js';

export const load = async ({ parent, depends, params }) => {
    const { site } = await parent();
    depends(Dependencies.DOMAINS);

    let domain: Domain;
    let domainsList: DomainsList;
    if (isCloud) {
        [domain, domainsList] = await Promise.all([
            sdk.forConsole.domains.get(params.domain),
            sdk.forConsole.domains.list()
        ]);
    }

    return {
        site,
        domain,
        domainsList
    };
};
