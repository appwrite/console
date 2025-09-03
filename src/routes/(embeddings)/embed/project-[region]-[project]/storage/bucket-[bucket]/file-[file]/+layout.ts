import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.FILE);
    depends(Dependencies.FILE_TOKENS);

    return {
        file: await sdk
            .forProject(params.region, params.project)
            .storage.getFile({ bucketId: params.bucket, fileId: params.file }),
        tokens: await sdk
            .forProject(params.region, params.project)
            .tokens.list({ bucketId: params.bucket, fileId: params.file })
    };
};
