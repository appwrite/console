import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import { Dependencies } from '$lib/constants.js';
import { type Models, Query } from '@appwrite.io/console';

export const load = async ({ parent, depends, params, url }) => {
    const { site, organization } = await parent();
    depends(Dependencies.SITES_DOMAINS);

    const ruleId = url.searchParams.get('rule');
    if (!ruleId) {
        throw new Error('Rule ID is required');
    }

    const [proxyRule, domainsList] = await Promise.all([
        sdk.forProject(params.region, params.project).proxy.getRule({ ruleId }),
        isCloud
            ? sdk.forConsole.domains.list({
                  queries: [Query.equal('teamId', organization.$id)]
              })
            : Promise.resolve<Models.DomainsList | null>(null)
    ]);

    return {
        site,
        proxyRule,
        domainsList
    };
};
