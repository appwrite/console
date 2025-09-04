import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.BUCKET);

    return {
        bucket: await sdk.forProject(params.region, params.project).storage.getBucket({
            bucketId: params.bucket
        })
    };
};
