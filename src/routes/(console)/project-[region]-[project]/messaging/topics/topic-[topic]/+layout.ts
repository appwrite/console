import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.MESSAGING_TOPIC);

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        topic: await sdk.forProject(params.region, params.project).messaging.getTopic(params.topic)
    };
};
