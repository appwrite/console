import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import type { LayoutLoad } from './$types';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import { Dependencies } from '$lib/constants';

export const load: LayoutLoad = async ({ depends }) => {
    depends(Dependencies.FUNCTION_INSTALLATIONS);
    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        installations: await sdk.forProject.vcs.listInstallations([Query.limit(100)])
    };
};
