import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.MESSAGING_PROVIDER);

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        provider: await sdk.forProject.messaging.getProvider(params.provider)
    };
};
