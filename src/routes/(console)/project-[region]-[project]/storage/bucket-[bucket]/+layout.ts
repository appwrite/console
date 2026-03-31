import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { guardResourceBlock } from '$lib/helpers/project';

export const load: LayoutLoad = async ({ params, depends, parent }) => {
    depends(Dependencies.BUCKET);
    const { project } = await parent();
    guardResourceBlock(project, 'buckets', params.bucket);

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        bucket: await sdk.forProject(params.region, params.project).storage.getBucket({
            bucketId: params.bucket
        })
    };
};
