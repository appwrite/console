import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import { Query } from '@appwrite.io/console';

export const load: PageLoad = async ({ depends }) => {
    depends(Dependencies.PROJECT_VARIABLES);
    depends(Dependencies.PROJECT_INSTALLATIONS);

    return {
        variables: await sdk.forProject.projectApi.listVariables(),
        installations: await sdk.forProject.vcs.listInstallations([Query.limit(10)])
    };
};
