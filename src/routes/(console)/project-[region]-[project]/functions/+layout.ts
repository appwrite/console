import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import { Dependencies } from '$lib/constants';
import { isCloud } from '$lib/system';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ depends, params }) => {
    depends(Dependencies.FUNCTION_INSTALLATIONS);

    const [runtimesList, installations, specificationsList] = await Promise.all([
        sdk.forProject(params.region, params.project).functions.listRuntimes(),
        sdk
            .forProject(params.region, params.project)
            .vcs.listInstallations({ queries: [Query.limit(100)] }),
        isCloud
            ? sdk.forProject(params.region, params.project).functions.listSpecifications()
            : Promise.resolve({ specifications: [], total: 0 })
    ]);

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        runtimesList,
        installations,
        specificationsList
    };
};
