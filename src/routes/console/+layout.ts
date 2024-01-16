import { Dependencies } from '$lib/constants';
import type { Plan } from '$lib/sdk/billing';
import type { Tier } from '$lib/stores/billing';
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

    let plansInfo = new Map<Tier, Plan>();
    if (isCloud) {
        const plansArray = await sdk.forConsole.billing.getPlansInfo();
        plansInfo = plansArray.plans.reduce((map, plan) => {
            map.set(plan.$id as Tier, plan);
            return map;
        }, new Map<Tier, Plan>());
    }

    return {
        consoleVariables: variables,
        version: data?.version ?? null,
        plansInfo
    };
};
