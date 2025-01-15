import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ depends }) => {
    depends(Dependencies.FUNCTION_INSTALLATIONS);

    const [runtimesList, installations, templatesList, specificationsList] = await Promise.all([
        sdk.forProject.functions.listRuntimes(),
        sdk.forProject.vcs.listInstallations([Query.limit(100)]),
        sdk.forProject.functions.listTemplates(undefined, undefined, 100),
        sdk.forProject.functions.listSpecifications()
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
