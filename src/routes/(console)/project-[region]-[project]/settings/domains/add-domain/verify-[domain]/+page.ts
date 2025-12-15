import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import { Dependencies } from '$lib/constants.js';
import { type Models, Query } from '@appwrite.io/console';

export const load = async ({ depends, parent, params, url }) => {
    const { project, organization } = await parent();
    depends(Dependencies.DOMAINS);

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
        project,
        domainsList,
        proxyRule
    };
};
