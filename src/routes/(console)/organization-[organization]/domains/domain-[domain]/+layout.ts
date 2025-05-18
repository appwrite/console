import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';

export const load = async ({ depends, params }) => {
    depends(Dependencies.DOMAIN);

    return {
        domain: await sdk.forConsole.domains.get(params.domain),
        header: Header,
        breadcrumbs: Breadcrumbs
    };
};
