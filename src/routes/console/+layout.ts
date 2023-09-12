import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';

import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, depends }) => {
    depends(Dependencies.RUNTIMES);
    depends(Dependencies.CONSOLE_VARIABLES);

    const { endpoint, project } = sdk.forConsole.client.config;
    const response = await fetch(`${endpoint}/health/version`, {
        headers: {
            'X-Appwrite-Project': project
        }
    });
    const data = await response.json();

    return {
        consoleVariables: sdk.forConsole.console.variables(),
        version: data?.version ?? null
    };
};
