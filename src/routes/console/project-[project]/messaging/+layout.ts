import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import type { LayoutLoad } from './$types';

// import { sdk } from '$lib/stores/sdk';

// const loadProviders = async () => {
//     return sdk.forProject.messaging.listProviders();
// };

export const load: LayoutLoad = async () => {
    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        // providers: loadProviders()
    };
};
