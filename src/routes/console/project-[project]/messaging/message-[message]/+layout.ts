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

        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            message: response
        };
    } catch (e) {
        throw error(e.code, e.message);
    }
};
