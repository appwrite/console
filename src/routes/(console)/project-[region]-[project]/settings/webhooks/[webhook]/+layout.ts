import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.WEBHOOK);

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        webhook: await sdk.forProject(params.region, params.project).webhooks.get({
            webhookId: params.webhook
        })
    };
};
