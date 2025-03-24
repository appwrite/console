import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants.js';
import { isCloud } from '$lib/system';
import type { Domain, DomainsList } from '$lib/sdk/domains.js';
import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';

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
        if (domain?.nameservers.toLocaleLowerCase() === 'appwrite') {
            redirect(
                303,
                `${base}/console/project-${params.project}/sites/site-${params.site}/domains`
            );
        }
    }

    return {
        site,
        domain,
        domainsList
    };
};
