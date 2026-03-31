import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import { guardResourceBlock } from '$lib/helpers/project';

export const load: LayoutLoad = async ({ params, depends, parent }) => {
    depends(Dependencies.FILE);
    depends(Dependencies.FILE_TOKENS);
    const { project } = await parent();
    guardResourceBlock(project, 'files', params.file);

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        file: await sdk
            .forProject(params.region, params.project)
            .storage.getFile({ bucketId: params.bucket, fileId: params.file }),
        tokens: await sdk
            .forProject(params.region, params.project)
            .tokens.list({ bucketId: params.bucket, fileId: params.file })
    };
};
