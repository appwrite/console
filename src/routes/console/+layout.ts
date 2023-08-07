import { sdk } from '$lib/stores/sdk';

import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
    const { endpoint, project } = sdk.forConsole.client.config;
    const response = await fetch(`${endpoint}/health/version`, {
        headers: {
            'X-Appwrite-Project': project
        }
    });
    const data = await response.json();

    return {
        version: data?.version ?? null
    };
};
