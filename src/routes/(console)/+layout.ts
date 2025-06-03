import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import type { LayoutLoad } from './$types';
import { Query } from '@appwrite.io/console';
import { Dependencies } from '$lib/constants';
import type { Tier } from '$lib/stores/billing';
import type { Plan, PlanList } from '$lib/sdk/billing';
import { consoleVariables, version } from '$routes/(console)/store';

export const load: LayoutLoad = async ({ params, depends, parent }) => {
    await parent();
    depends(Dependencies.RUNTIMES);
    depends(Dependencies.CONSOLE_VARIABLES);
    depends(Dependencies.ORGANIZATION);

    const { endpoint, project } = sdk.forConsole.client.config;
    const [preferences, plansArray, organizations] = await loadPromises();

    const plansInfo = toPlanMap(plansArray);

    const currentOrgId =
        params.organization ??
        preferences.organization ??
        (organizations.teams.length > 0 ? organizations.teams[0].$id : undefined);

    fetch(`${endpoint}/health/version`, {
        headers: { 'X-Appwrite-Project': project }
    })
        .then((res) => res.json().catch(() => null))
        .then((data) => version.set(data?.version));

    sdk.forConsole.console.variables().then((vars) => consoleVariables.set(vars));

    return {
        plansInfo,
        roles: [],
        scopes: [],
        preferences,
        currentOrgId,
        organizations,
        currentProjectId: params.project ?? '',
        projectsPromise: sdk.forConsole.projects.list([
            Query.equal('teamId', currentOrgId),
            Query.limit(5),
            Query.orderDesc('$updatedAt')
        ])
    };
};

async function loadPromises() {
    return Promise.all([
        sdk.forConsole.account.getPrefs(),
        isCloud ? sdk.forConsole.billing.getPlansInfo() : Promise.resolve(null),
        isCloud ? sdk.forConsole.billing.listOrganization() : sdk.forConsole.teams.list()
    ]);
}

function toPlanMap(plansArray: PlanList | null): Map<Tier, Plan> {
    const map = new Map<Tier, Plan>();
    if (!plansArray?.plans.length) return map;

    const plans = plansArray.plans;
    for (let i = 0; i < plans.length; i++) {
        const plan = plans[i];
        map.set(plan.$id as Tier, plan);
    }

    return map;
}
