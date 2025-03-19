import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import { RuleTrigger, RuleType } from '$lib/stores/sdk';

export const load = async ({ parent }) => {
    const { function: func } = await parent();

    const [domains, installations] = await Promise.all([
        sdk.forProject.proxy.listRules([
            Query.equal('type', RuleType.DEPLOYMENT),
            Query.equal('trigger', RuleTrigger.MANUAL)
        ]),
        sdk.forProject.vcs.listInstallations()
    ]);

    return {
        func,
        domains,
        installations,
        branches:
            func?.installationId && func?.providerRepositoryId
                ? await sdk.forProject.vcs.listRepositoryBranches(
                      func.installationId,
                      func.providerRepositoryId
                  )
                : undefined
    };
};
