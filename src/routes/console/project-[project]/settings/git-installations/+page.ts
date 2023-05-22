import { Dependencies } from '$lib/constants';
import { sdkForProject } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends }) => {
    depends(Dependencies.INSTALLATIONS);

    return {
        installations: await sdkForProject.vcs.listInstallations()
    };
};
