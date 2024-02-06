import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.MESSAGING_MESSAGE);

    try {
        const message = await sdk.forProject.messaging.getMessage(params.message);

        const topicsById = {};
        const topicsPromise = Promise.allSettled(
            message.topics.map((topicId) => sdk.forProject.messaging.getTopic(topicId))
        ).then((results) => {
            results.forEach((result) => {
                if (result.status === 'fulfilled') {
                    topicsById[result.value.$id] = result.value;
                }
            });
        });

        const targetsById = {};
        const targetsPromise = sdk.forProject.messaging
            .listTargets(params.message)
            .then((response) => {
                response.targets.forEach((target) => {
                    targetsById[target.$id] = target;
                });
            });

        await Promise.allSettled([topicsPromise, targetsPromise]);

        return {
            message,
            topicsById,
            targetsById,
            header: Header,
            breadcrumbs: Breadcrumbs
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
