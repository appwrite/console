import { sdk } from '$lib/stores/sdk';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params }) => {
    return {
        artifact: await sdk.forProject(params.region, params.project).imagine.get(params.artifact)
    };
};
