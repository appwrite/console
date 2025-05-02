import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { RuleTrigger, RuleType } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants.js';

export const load = async ({ parent, depends }) => {
    const { site } = await parent();
    depends(Dependencies.DOMAINS, Dependencies.SITES_DOMAINS);

    const [rules, installations] = await Promise.all([
        sdk
            .forProject(page.params.region, page.params.project)
            .proxy.listRules([
                Query.equal('type', RuleType.DEPLOYMENT),
                Query.equal('trigger', RuleTrigger.MANUAL)
            ]),
        sdk.forProject(page.params.region, page.params.project).vcs.listInstallations()
    ]);

    return {
        site,
        rules,
        installations,
        branches:
            site?.installationId && site?.providerRepositoryId
                ? await sdk
                      .forProject(page.params.region, page.params.project)
                      .vcs.listRepositoryBranches(site.installationId, site.providerRepositoryId)
                : undefined
    };
};
