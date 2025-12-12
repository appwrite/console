import { Query, type Models } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { RuleTrigger, RuleType } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants.js';
import { isCloud } from '$lib/system';

export const load = async ({ parent, depends, params }) => {
    const { site, organization } = await parent();
    depends(Dependencies.DOMAINS, Dependencies.SITES_DOMAINS);

    const [rules, installations, domainsList] = await Promise.all([
        sdk.forProject(params.region, params.project).proxy.listRules({
            queries: [
                Query.equal('type', RuleType.DEPLOYMENT),
                Query.equal('trigger', RuleTrigger.MANUAL)
            ]
        }),
        sdk.forProject(params.region, params.project).vcs.listInstallations(),
        isCloud
            ? sdk.forConsole.domains.list({
                  queries: [Query.equal('teamId', organization.$id)]
              })
            : Promise.resolve<Models.DomainsList | null>(null)
    ]);

    return {
        site,
        rules,
        domainsList,
        installations,
        branches:
            site?.installationId && site?.providerRepositoryId
                ? await sdk.forProject(params.region, params.project).vcs.listRepositoryBranches({
                      installationId: site.installationId,
                      providerRepositoryId: site.providerRepositoryId
                  })
                : undefined
    };
};
