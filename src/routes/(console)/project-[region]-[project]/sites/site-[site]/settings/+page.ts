import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';

export const load = async ({ params, depends, parent }) => {
    depends(Dependencies.VARIABLES);
    depends(Dependencies.SITE);
    const { site } = await parent();

    const [globalVariables, variables, frameworks, installations, specificationsList] =
        await Promise.all([
            sdk.forProject(params.region, params.project).projectApi.listVariables(),
            sdk.forProject(params.region, params.project).sites.listVariables(params.site),
            sdk.forProject(params.region, params.project).sites.listFrameworks(),
            sdk.forProject(params.region, params.project).vcs.listInstallations(),
            sdk.forProject(params.region, params.project).sites.listSpecifications()
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

    const enabledSpecs = specificationsList?.specifications?.filter((s) => s.enabled) ?? [];
    if (!enabledSpecs.some((s) => s.slug === site.specification)) {
        site.specification = enabledSpecs[0]?.slug;
    }

    return {
        site,
        frameworks,
        variables,
        globalVariables,
        installations,
        specificationsList
    };
};
