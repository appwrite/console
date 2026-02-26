import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { Query, type Models } from '@appwrite.io/console';
import { RuleType } from '$lib/stores/sdk';
import { DeploymentResourceType } from '$lib/stores/sdk';

export const load = async ({ params, depends, parent }) => {
    depends(Dependencies.SITE);
    depends(Dependencies.SITES_DOMAINS);
    const { site } = await parent();

    const [deploymentList, prodReadyDeployments, proxyRuleList] = await Promise.all([
        sdk.forProject(params.region, params.project).sites.listDeployments({
            siteId: params.site,
            queries: [
                Query.limit(4),
                Query.orderDesc(''),
                Query.select([
                    'status',
                    'type',
                    'resourceId',
                    'providerRepositoryUrl',
                    'providerRepositoryOwner',
                    'providerRepositoryName',
                    'providerBranchUrl',
                    'providerBranch',
                    'providerCommitMessage',
                    'providerCommitHash',
                    'providerCommitUrl'
                ])
            ]
        }),
        sdk.forProject(params.region, params.project).sites.listDeployments({
            siteId: params.site,
            queries: [
                Query.equal('status', 'ready'),
                Query.equal('activate', true),
                Query.limit(1),
                Query.orderDesc(''),
                Query.select([
                    'buildDuration',
                    'totalSize',
                    'sourceSize',
                    'buildSize',
                    'type',
                    'resourceId'
                ])
            ]
        }),
        sdk.forProject(params.region, params.project).proxy.listRules({
            queries: [
                Query.equal('type', RuleType.DEPLOYMENT),
                Query.equal('deploymentResourceType', DeploymentResourceType.SITE),
                Query.equal('deploymentResourceId', site.$id),
                Query.equal('deploymentId', site.deploymentId),
                Query.orderDesc('')
            ]
        })
    ]);

    const [deployment, repository] = await Promise.all([
        deploymentList?.total && site.deploymentId
            ? loadDeployment({
                  region: params.region,
                  project: params.project,
                  siteId: params.site,
                  deploymentId: site.deploymentId
              })
            : Promise.resolve(null),
        site.installationId && site.providerRepositoryId
            ? loadRepository({
                  region: params.region,
                  project: params.project,
                  installationId: site.installationId,
                  providerRepositoryId: site.providerRepositoryId
              })
            : Promise.resolve(null)
    ]);

    return {
        site,
        deploymentList,
        deployment,
        repository,
        proxyRuleList,
        prodReadyDeployments,
        hasProdReadyDeployments:
            prodReadyDeployments?.deployments?.filter((d) => d?.$id !== deployment?.$id).length > 0
    };
};

async function loadDeployment({
    region,
    project,
    siteId,
    deploymentId
}: {
    region: string;
    project: string;
    siteId: string;
    deploymentId: string;
}): Promise<Models.Deployment | null> {
    try {
        return await sdk.forProject(region, project).sites.getDeployment({
            siteId,
            deploymentId
        });
    } catch (error) {
        return null;
    }
}

async function loadRepository({
    region,
    project,
    installationId,
    providerRepositoryId
}: {
    region: string;
    project: string;
    installationId: string;
    providerRepositoryId: string;
}): Promise<Models.ProviderRepository | null> {
    try {
        return await sdk.forProject(region, project).vcs.getRepository({
            installationId,
            providerRepositoryId
        });
    } catch (error) {
        return null;
    }
}
