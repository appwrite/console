import { Dependencies } from '$lib/constants';
import { View, getPage, getView } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url, route, depends }) => {
    depends(Dependencies.WEBHOOKS);

    const page = getPage(url);
    const view = getView(params.project, url, route, View.Grid);

    return {
        page,
        view,
        webhooks: await sdk.forConsole.projects.listWebhooks(params.project)
    };
};
