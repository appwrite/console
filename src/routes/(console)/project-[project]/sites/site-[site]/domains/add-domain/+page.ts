import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { RuleTrigger, RuleType } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants.js';

export const load = async ({ parent, depends }) => {
    const { site } = await parent();
    depends(Dependencies.DOMAINS);

    const [domains, installations] = await Promise.all([
        sdk.forProject.proxy.listRules([
            Query.equal('type', RuleType.DEPLOYMENT),
            Query.equal('trigger', RuleTrigger.MANUAL)
        ]),
        sdk.forProject.vcs.listInstallations()
    ]);

    return {
        site,
        domains,
        installations,
        branches:
            site?.installationId && site?.providerRepositoryId
                ? await sdk.forProject.vcs.listRepositoryBranches(
                      site.installationId,
                      site.providerRepositoryId
                  )
                : undefined
    };
};
