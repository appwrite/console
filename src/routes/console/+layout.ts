import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, depends }) => {
    depends(Dependencies.RUNTIMES);
    depends(Dependencies.CONSOLE_VARIABLES);

    const { endpoint, project } = sdk.forConsole.client.config;
    const versionPromise = fetch(`${endpoint}/health/version`, {
        headers: {
            'X-Appwrite-Project': project
        }
    }).then((response) => response.json() as { version?: string });

    const variablesPromise = sdk.forConsole.console.variables();

    const [data, variables] = await Promise.all([versionPromise, variablesPromise]);

    let plansInfo = null;
    if (isCloud) {
        plansInfo = await sdk.forConsole.billing.getPlansInfo();
    }

    return {
        consoleVariables: variables,
        version: data?.version ?? null,
        plansInfo
    };
};
