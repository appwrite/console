import { Dependencies } from '$lib/constants';
import type { Tier } from '$lib/stores/billing';
import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import type { Models } from '@appwrite.io/console';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch, depends, parent }) => {
    await parent();

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

    let plansInfo = new Map<Tier, Models.BillingPlan>();
    if (isCloud) {
        const plansArray = await sdk.forConsole.console.plans();
        plansInfo = plansArray.plans.reduce((map, plan) => {
            map.set(plan.$id as Tier, plan);
            return map;
        }, new Map<Tier, Models.BillingPlan>());
    }

    return {
        consoleVariables: variables,
        version: data?.version ?? null,
        plansInfo,
        roles: [],
        scopes: []
    };
};
