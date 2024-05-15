import Header from './header.svelte';
import Breadcrumbs from './breadcrumbs.svelte';
import type { LayoutLoad } from './$types';
import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';

export const load: LayoutLoad = async ({ depends }) => {
    depends(Dependencies.FACTORS);

    return {
        factors: await sdk.forConsole.account.listMfaFactors(),
        header: Header,
        breadcrumbs: Breadcrumbs
    };
};
