import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.FILE);
    depends(Dependencies.FILE_TOKENS);

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        file: await sdk
            .forProject(params.region, params.project)
            .storage.getFile(params.bucket, params.file),
        tokens: await sdk
            .forProject(params.region, params.project)
            .tokens.list(params.bucket, params.file)
    };
};
