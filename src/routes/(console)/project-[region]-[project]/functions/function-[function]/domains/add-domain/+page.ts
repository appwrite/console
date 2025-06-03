import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import { RuleTrigger, RuleType } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { isCloud } from '$lib/system';

export const load = async ({ parent, depends, params }) => {
    const { function: func, organization } = await parent();
    depends(Dependencies.DOMAINS, Dependencies.FUNCTION_DOMAINS);

    const [rules, installations, domains] = await Promise.all([
        sdk
            .forProject(params.region, params.project)
            .proxy.listRules([
                Query.equal('type', RuleType.DEPLOYMENT),
                Query.equal('trigger', RuleTrigger.MANUAL)
            ]),
        sdk.forProject(params.region, params.project).vcs.listInstallations(),
        isCloud
            ? sdk.forConsole.domains.list([Query.equal('teamId', organization.$id)])
            : Promise.resolve(null)
    ]);

    return {
        func,
        rules,
        domains,
        installations,
        branches:
            func?.installationId && func?.providerRepositoryId
                ? await sdk
                      .forProject(params.region, params.project)
                      .vcs.listRepositoryBranches(func.installationId, func.providerRepositoryId)
                : undefined
    };
};
