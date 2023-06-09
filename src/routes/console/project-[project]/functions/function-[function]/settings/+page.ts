import { sdkForProject } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, depends }) => {
    const parentData = await parent();
    depends(Dependencies.FUNCTION);
    depends(Dependencies.VARIABLES);

    return {
        variables: await sdkForProject.functions.listVariables(params.function),
        installations: await sdkForProject.vcs.listInstallations(),
        repository: parentData.function.vcsInstallationId
            ? await sdkForProject.vcs.getRepository(
                  parentData.function.vcsInstallationId,
                  parentData.function.vcsRepositoryId
              )
            : null,
        installation: parentData.function.vcsInstallationId
            ? await sdkForProject.vcs.getInstallation(parentData.function.vcsInstallationId)
            : null
    };
};
