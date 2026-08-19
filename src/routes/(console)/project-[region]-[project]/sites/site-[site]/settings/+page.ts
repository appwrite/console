import { sdk } from '$lib/stores/sdk';
import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { isCloud } from '$lib/system';
import { Query } from '@appwrite.io/console';
import { trimLeadingDisabledSpecifications } from '$lib/helpers/specifications';

const VARIABLES_LIMIT = 100;

export const load = async ({ params, depends, parent }) => {
    depends(Dependencies.VARIABLES);
    depends(Dependencies.SITE);
    const limit = PAGE_LIMIT;
    const variablesOffset = 0;
    const { site } = await parent();

    const [
        globalVariables,
        variables,
        frameworks,
        installations,
        buildSpecificationsList,
        runtimeSpecificationsList
    ] = await Promise.all([
        sdk.forProject(params.region, params.project).projectApi.listVariables({
            queries: [Query.limit(VARIABLES_LIMIT)]
        }),
        sdk.forProject(params.region, params.project).sites.listVariables({
            siteId: params.site,
            queries: [Query.limit(limit), Query.offset(variablesOffset)]
        }),
        sdk.forProject(params.region, params.project).sites.listFrameworks(),
        sdk.forProject(params.region, params.project).vcs.listInstallations(),
        isCloud
            ? sdk
                  .forProject(params.region, params.project)
                  .sites.listSpecifications({ type: 'builds' })
            : Promise.resolve({ specifications: [], total: 0 }),
        isCloud
            ? sdk
                  .forProject(params.region, params.project)
                  .sites.listSpecifications({ type: 'runtimes' })
            : Promise.resolve({ specifications: [], total: 0 })
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

    const buildEnabledSpecs = buildSpecificationsList.specifications.filter((s) => s.enabled);
    const runtimeEnabledSpecs = runtimeSpecificationsList.specifications.filter((s) => s.enabled);
    if (
        buildEnabledSpecs.length &&
        !buildEnabledSpecs.some((s) => s.slug === site.buildSpecification)
    ) {
        site.buildSpecification = buildEnabledSpecs[0]?.slug;
    }
    if (
        runtimeEnabledSpecs.length &&
        !runtimeEnabledSpecs.some((s) => s.slug === site.runtimeSpecification)
    ) {
        site.runtimeSpecification = runtimeEnabledSpecs[0]?.slug;
    }

    return {
        site,
        frameworks,
        variables,
        globalVariables,
        limit,
        variablesOffset,
        installations,
        buildSpecificationsList: trimLeadingDisabledSpecifications(buildSpecificationsList),
        runtimeSpecificationsList
    };
};
