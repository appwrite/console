import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import Header from '$routes/(console)/project-[region]-[project]/storage/bucket-[bucket]/header.svelte';
import { base } from '$app/paths';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.BUCKET);

    return {
        header: Header,
        path: `${base}/embed/project-${params.region}-${params.project}/storage/bucket-${params.bucket}`,
        back: `${base}/embed/project-${params.region}-${params.project}/storage`,
        bucket: await sdk.forProject(params.region, params.project).storage.getBucket({
            bucketId: params.bucket
        })
    };
};
