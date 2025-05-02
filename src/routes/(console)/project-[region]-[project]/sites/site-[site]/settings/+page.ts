import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { page } from '$app/state';

export const load = async ({ params, depends, parent }) => {
    depends(Dependencies.VARIABLES);
    depends(Dependencies.SITE);
    const { site } = await parent();

    const [globalVariables, variables, frameworks, installations, specificationsList] =
        await Promise.all([
            sdk.forProject(page.params.region, page.params.project).projectApi.listVariables(),
            sdk
                .forProject(page.params.region, page.params.project)
                .sites.listVariables(params.site),
            sdk.forProject(page.params.region, page.params.project).sites.listFrameworks(),
            sdk.forProject(page.params.region, page.params.project).vcs.listInstallations(),
            sdk.forProject(page.params.region, page.params.project).sites.listSpecifications()
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
        site,
        frameworks,
        variables,
        globalVariables,
        installations,
        specificationsList
    };
};
