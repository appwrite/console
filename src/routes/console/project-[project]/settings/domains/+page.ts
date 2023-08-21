import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends, url }) => {
    depends(Dependencies.DOMAINS);

    return {
        domains: await sdk.forConsole.projects.listDomains(params.project),
        create: url.searchParams.get('create') !== null
    };
};
