import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { sdk } from '$lib/stores/sdk';
import { Dependencies } from '$lib/constants';
import { error } from '@sveltejs/kit';
import type { Message } from '../store';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.MESSAGING_MESSAGE);

    try {
        const response: Message = await sdk.forProject.client.call(
            'GET',
            new URL(
                `${sdk.forProject.client.config.endpoint}/messaging/messages/${params.message}`
            ),
            {
                'X-Appwrite-Project': sdk.forProject.client.config.project,
                'content-type': 'application/json',
                'X-Appwrite-Mode': 'admin'
            }
        );

        const topicsById = {};
        const topicsPromise = Promise.allSettled(
            response.topics.map((topicId) => {
                return sdk.forProject.client.call(
                    'GET',
                    new URL(`${sdk.forProject.client.config.endpoint}/messaging/topics/${topicId}`),
                    {
                        'X-Appwrite-Project': sdk.forProject.client.config.project,
                        'content-type': 'application/json',
                        'X-Appwrite-Mode': 'admin'
                    }
                );
            })
        ).then((results) => {
            results.forEach((result) => {
                if (result.status === 'fulfilled') {
                    topicsById[result.value.$id] = result.value;
                }
            });
        });

        const targetsById = {};
        const targetsPromise = sdk.forProject.client
            .call(
                'GET',
                new URL(
                    `${sdk.forProject.client.config.endpoint}/messaging/messages/${params.message}/targets`
                ),
                {
                    'X-Appwrite-Project': sdk.forProject.client.config.project,
                    'content-type': 'application/json',
                    'X-Appwrite-Mode': 'admin'
                }
            )
            .then((response) => {
                response.targets.forEach((target) => {
                    targetsById[target.$id] = target;
                });
            });

        await Promise.allSettled([topicsPromise, targetsPromise]);

        return {
            topicsById,
            targetsById,
            header: Header,
            breadcrumbs: Breadcrumbs,
            message: response
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
