import { sdkForProject } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, depends }) => {
    const parentData = await parent();
    depends(Dependencies.VARIABLES);

    return {
        variables: await sdkForProject.functions.listVariables(params.function),
        installations: await sdkForProject.vcs.listInstallations(),
        branches: parentData.function.vcsInstallationId
            ? await sdkForProject.vcs.listRepositoryBranches(
                  parentData.function.vcsInstallationId,
                  parentData.function.repositoryId
              )
            : null
    };
};
