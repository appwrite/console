import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';

export const load = async ({ depends, params }) => {
    depends(Dependencies.DOMAIN);

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        domain: await sdk.forConsole.domains.get({
            domainId: params.domain
        })
    };
};
