import { sdk } from '$lib/stores/sdk';
import { Query, type Models } from '@appwrite.io/console';
import { RuleTrigger, RuleType } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { isCloud } from '$lib/system';

export const load = async ({ parent, depends, params }) => {
    const { function: func, organization } = await parent();
    depends(Dependencies.DOMAINS, Dependencies.FUNCTION_DOMAINS);

    const [rules, installations, domainsList] = await Promise.all([
        sdk.forProject(params.region, params.project).proxy.listRules({
            queries: [
                Query.equal('type', RuleType.DEPLOYMENT),
                Query.equal('trigger', RuleTrigger.MANUAL)
            ]
        }),
        sdk.forProject(params.region, params.project).vcs.listInstallations(),
        isCloud
            ? sdk.forConsole.domains.list({ queries: [Query.equal('teamId', organization.$id)] })
            : Promise.resolve<Models.DomainsList>({ total: 0, domains: [] })
    ]);

    return {
        func,
        rules,
        domainsList,
        installations,
        branches:
            func?.installationId && func?.providerRepositoryId
                ? await sdk.forProject(params.region, params.project).vcs.listRepositoryBranches({
                      installationId: func.installationId,
                      providerRepositoryId: func.providerRepositoryId
                  })
                : undefined
    };
};
