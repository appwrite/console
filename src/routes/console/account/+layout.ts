import Header from './header.svelte';
import Breadcrumbs from './breadcrumbs.svelte';
import type { LayoutLoad } from './$types';
import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';

export const load: LayoutLoad = async ({ depends }) => {
    depends(Dependencies.FACTORS);
    depends(Dependencies.IDENTITIES);

    const promises = [
        sdk.forConsole.account.listFactors(),
        sdk.forConsole.account.listIdentities()
    ];

    const [factors, identities] = await Promise.all(promises);

    return {
        factors,
        identities,
        header: Header,
        breadcrumbs: Breadcrumbs
    };
};
