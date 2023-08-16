import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ depends }) => {
    depends(Dependencies.FUNCTION_INSTALLATIONS);

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        installations: sdk.forProject.vcs.listInstallations([Query.limit(100)])
    };
};
