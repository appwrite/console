import { sdk } from '$lib/stores/sdk';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, parent }) => {
    return {
        artifact: await sdk.forProject.imagine.get(params.artifact)
    };
};
