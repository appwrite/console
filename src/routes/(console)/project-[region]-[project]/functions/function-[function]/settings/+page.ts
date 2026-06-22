import { sdk } from '$lib/stores/sdk';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { Query } from '@appwrite.io/console';

const VARIABLES_LIMIT = 100;

export const load = async ({ params, depends, parent }) => {
    depends(Dependencies.VARIABLES);
    depends(Dependencies.FUNCTION);

    const limit = PAGE_LIMIT;
    const variablesOffset = 0;

    const {
        runtimesList,
        specificationsList,
        runtimeSpecificationsList,
        function: fn
    } = await parent();

    const buildEnabledSpecs = specificationsList?.specifications?.filter((s) => s.enabled) ?? [];
    const runtimeEnabledSpecs =
        runtimeSpecificationsList?.specifications?.filter((s) => s.enabled) ?? [];
    if (!buildEnabledSpecs.some((s) => s.slug === fn.buildSpecification)) {
        fn.buildSpecification = buildEnabledSpecs[0]?.slug;
    }
    if (!runtimeEnabledSpecs.some((s) => s.slug === fn.runtimeSpecification)) {
        fn.runtimeSpecification = runtimeEnabledSpecs[0]?.slug;
    }

    const [globalVariables, variables] = await Promise.all([
        sdk.forProject(params.region, params.project).projectApi.listVariables({
            queries: [Query.limit(VARIABLES_LIMIT)]
        }),
        sdk.forProject(params.region, params.project).functions.listVariables({
            functionId: params.function,
            queries: [Query.limit(limit), Query.offset(variablesOffset)]
        })
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
        limit,
        variablesOffset,
        runtimesList,
        specificationsList,
        runtimeSpecificationsList,
        function: fn
    };
};
