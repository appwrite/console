import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import type { LayoutLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.WEBHOOK);

    try {
        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            webhook: await sdk.forConsole.projects.getWebhook(params.project, params.webhook)
        };
    } catch (e) {
        error(e.code, e.message);
    }
};
