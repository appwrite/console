import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import { Dependencies } from '$lib/constants.js';
import { type Models, Query } from '@appwrite.io/console';

export const load = async ({ params, parent, depends, url }) => {
    const { site, organization } = await parent();
    depends(Dependencies.SITES_DOMAINS);

    const ruleId = url.searchParams.get('rule');
    if (!ruleId) {
        throw new Error('Rule ID is required');
    }

    let domainsList: Models.DomainsList;
    if (isCloud) {
        domainsList = await sdk.forConsole.domains.list({
            queries: [Query.equal('teamId', organization.$id)]
        });
    }

    const proxyRule = await sdk.forProject(params.region, params.project).proxy.getRule({ ruleId });

    return {
        site,
        domainsList,
        proxyRule
    };
};
