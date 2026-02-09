import Header from './header.svelte';
import Breadcrumbs from './breadcrumbs.svelte';
import type { LayoutLoad } from './$types';
import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { Platform, Query } from '@appwrite.io/console';

export const load: LayoutLoad = async ({ depends }) => {
    depends(Dependencies.FACTORS);
    depends(Dependencies.IDENTITIES);

    const [factors, identities] = await Promise.all([
        sdk.forConsole.account.listMFAFactors(),
        sdk.forConsole.account.listIdentities({
            queries: [Query.notContains('provider', Platform.Imagine)]
        })
    ]);

    return {
        factors,
        identities,
        header: Header,
        breadcrumbs: Breadcrumbs
    };
};
