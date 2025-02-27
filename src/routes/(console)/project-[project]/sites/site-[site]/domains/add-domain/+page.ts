import { Query } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { RuleType } from '$lib/stores/sdk';

export const load = async ({ parent }) => {
    const { site } = await parent();

    return {
        domains: await sdk.forProject.proxy.listRules([Query.equal('type', RuleType.DEPLOYMENT)]),
        branches:
            site?.installationId && site?.providerRepositoryId
                ? await sdk.forProject.vcs.listRepositoryBranches(
                      site.installationId,
                      site.providerRepositoryId
                  )
                : undefined
    };
};
