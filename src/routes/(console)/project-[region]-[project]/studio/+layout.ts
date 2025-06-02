import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.ARTIFACTS);
    sdk.forProject(params.region, params.project).project.client.setProject(params.project);

    try {
        return {
            artifacts: await sdk.forProject(params.region, params.project).imagine.list()
        };
    } catch (e) {
        error(e.code, e.message);
    }
};
