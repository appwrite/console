import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdkForProject } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, parent, depends }) => {
    await parent();
    depends(Dependencies.FILE);
    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        file: sdkForProject.storage.getFile(params.bucket, params.file)
    };
};
