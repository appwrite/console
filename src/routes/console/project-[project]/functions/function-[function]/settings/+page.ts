import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends, parent }) => {
    depends(Dependencies.VARIABLES);

    const data = await parent();

    const [repository, globalVariables, variables] = await Promise.all([
        (async () => {
            if (data.function.vcsInstallationId && data.function.vcsRepositoryId) {
                return await sdk.forProject.vcs.getRepository(
                    data.function.vcsInstallationId,
                    data.function.vcsRepositoryId
                );
            } else {
                return null;
            }
        })(),
        sdk.forProject.projectApi.listVariables(),
        sdk.forProject.functions.listVariables(params.function)
    ]);

    // Conflicting variables first
    variables.variables = variables.variables.sort((var1, var2) => {
        const isVar1Global =
            globalVariables.variables.find((variable) => variable.key === var1.key) !== undefined;
        const isVar2Global =
            globalVariables.variables.find((variable) => variable.key === var2.key) !== undefined;

        if (isVar1Global && isVar2Global) {
            return -var1.$createdAt.localeCompare(var2.$createdAt);
        } else if (isVar1Global) {
            return -1;
        } else if (isVar2Global) {
            return 1;
        } else {
            return -var1.$createdAt.localeCompare(var2.$createdAt);
        }
    });

    return {
        variables,
        globalVariables,
        repository
    };
};
