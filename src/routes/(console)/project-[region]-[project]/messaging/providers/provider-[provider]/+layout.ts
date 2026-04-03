import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { guardResourceBlock } from '$lib/helpers/project';

export const load: LayoutLoad = async ({ params, depends, parent }) => {
    depends(Dependencies.MESSAGING_PROVIDER);
    const { project } = await parent();
    guardResourceBlock(project, 'providers', params.provider);

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        provider: await sdk.forProject(params.region, params.project).messaging.getProvider({
            providerId: params.provider
        })
    };
};
