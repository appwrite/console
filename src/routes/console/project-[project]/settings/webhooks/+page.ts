import { Dependencies } from '$lib/constants';
import { sdkForConsole } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, depends }) => {
    depends(Dependencies.WEBHOOKS);

    return {
        webhooks: await sdkForConsole.projects.listWebhooks(params.project)
    };
};
