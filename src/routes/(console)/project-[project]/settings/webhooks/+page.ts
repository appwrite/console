import { Dependencies } from '$lib/constants';
import { getPage } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, depends }) => {
    depends(Dependencies.WEBHOOKS);

    const page = getPage(url);

    return {
        page,
        webhooks: await sdk.forConsole.projects.listWebhooks(params.project)
    };
};
