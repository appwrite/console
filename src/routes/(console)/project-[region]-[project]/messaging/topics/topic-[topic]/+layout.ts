import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { guardResourceBlock } from '$lib/helpers/project';

export const load: LayoutLoad = async ({ params, depends, parent }) => {
    depends(Dependencies.MESSAGING_TOPIC);
    const { project } = await parent();
    guardResourceBlock(project, 'topics', params.topic);

    return {
        header: Header,
        breadcrumbs: Breadcrumbs,
        topic: await sdk
            .forProject(params.region, params.project)
            .messaging.getTopic({ topicId: params.topic })
    };
};
