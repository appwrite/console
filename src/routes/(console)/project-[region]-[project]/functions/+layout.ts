import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ depends, params }) => {
    depends(Dependencies.FUNCTION_INSTALLATIONS);

    const [runtimesList, installations, templatesList, specificationsList] = await Promise.all([
        sdk.forProject(params.region, params.project).functions.listRuntimes(),
        sdk.forProject(params.region, params.project).vcs.listInstallations([Query.limit(100)]),
        sdk
            .forProject(params.region, params.project)
            .functions.listTemplates(undefined, undefined, 100),
        sdk.forProject(params.region, params.project).functions.listSpecifications()
    ]);

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        runtimesList,
        installations,
        templatesList,
        specificationsList
    };
};
