import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';
import Header from '$routes/(console)/project-[region]-[project]/storage/bucket-[bucket]/file-[file]/header.svelte';
import { base } from '$app/paths';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.FILE);
    depends(Dependencies.FILE_TOKENS);

    return {
        header: Header,
        back: `${base}/embed/project-${params.region}-${params.project}/storage/bucket-${params.bucket}`,
        file: await sdk
            .forProject(params.region, params.project)
            .storage.getFile({ bucketId: params.bucket, fileId: params.file }),
        tokens: await sdk
            .forProject(params.region, params.project)
            .tokens.list({ bucketId: params.bucket, fileId: params.file })
    };
};
