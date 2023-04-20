import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends }) => {
    depends(Dependencies.INSTALLATIONS);

    return {
        installations: await sdk.forProject.vcs.listInstallations()
    };
};
