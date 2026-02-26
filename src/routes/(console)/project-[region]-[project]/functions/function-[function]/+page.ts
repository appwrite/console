import { Query, type Models } from '@appwrite.io/console';
import { sdk } from '$lib/stores/sdk';
import { getLimit, getPage, getQuery, pageToOffset } from '$lib/helpers/load';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import type { PageLoad } from './$types';
import { queries, queryParamToMap } from '$lib/components/filters';

export const load: PageLoad = async ({ params, depends, url, route, parent }) => {
    const data = await parent();
    depends(Dependencies.DEPLOYMENTS);
    const page = getPage(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);
    const query = getQuery(url);

    const [deploymentList, activeDeployment, repository] = await Promise.all([
        loadDeploymentList({
            region: params.region,
            project: params.project,
            functionId: params.function,
            limit,
            offset,
            query
        }),
        data.function.deploymentId
            ? loadActiveDeployment({
                  region: params.region,
                  project: params.project,
                  functionId: params.function,
                  deploymentId: data.function.deploymentId
              })
            : Promise.resolve(null),
        data.function.installationId && data.function.providerRepositoryId
            ? loadRepository({
                  region: params.region,
                  project: params.project,
                  installationId: data.function.installationId,
                  providerRepositoryId: data.function.providerRepositoryId
              })
            : Promise.resolve(null)
    ]);

    return {
        offset,
        limit,
        query,
        installations: data.installations,
        activeDeployment,
        repository,
        deploymentList
    };
};

async function loadDeploymentList({
    region,
    project,
    functionId,
    limit,
    offset,
    query
}: {
    region: string;
    project: string;
    functionId: string;
    limit: number;
    offset: number;
    query: string;
}): Promise<Models.DeploymentList> {
    const parsedQueries = queryParamToMap(query || '[]');
    queries.set(parsedQueries);

    return sdk.forProject(region, project).functions.listDeployments({
        functionId,
        queries: [
            Query.limit(limit),
            Query.offset(offset),
            Query.orderDesc(''),
            Query.select([
                'buildSize',
                'sourceSize',
                'totalSize',
                'buildDuration',
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
            ]),
            ...parsedQueries.values()
        ]
    });
}

async function loadActiveDeployment({
    region,
    project,
    functionId,
    deploymentId
}: {
    region: string;
    project: string;
    functionId: string;
    deploymentId: string;
}): Promise<Models.Deployment | null> {
    try {
        return await sdk.forProject(region, project).functions.getDeployment({
            functionId,
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
