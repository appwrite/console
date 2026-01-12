import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import type { LayoutLoad } from './$types';
import { Dependencies } from '$lib/constants';
import { type Models, Platform, Query } from '@appwrite.io/console';

export const load: LayoutLoad = async ({ depends, parent }) => {
    const { organizations } = await parent();

    depends(Dependencies.RUNTIMES);
    depends(Dependencies.CONSOLE_VARIABLES);
    depends(Dependencies.ORGANIZATION);

    const { endpoint, project } = sdk.forConsole.client.config;
    const [preferences, plansArray, versionData, consoleVariables] = await Promise.all([
        sdk.forConsole.account.getPrefs(),
        isCloud
            ? sdk.forConsole.console.getPlans({
                  platform: Platform.Appwrite
              })
            : null,
        fetch(`${endpoint}/health/version`, {
            headers: { 'X-Appwrite-Project': project as string }
        }).then((response) => response.json() as { version?: string }),
        sdk.forConsole.console.variables()
    ]);

    const plansInfo = toPlanMap(plansArray);

    const currentOrgId =
        preferences.organization ??
        (organizations.teams.length > 0 ? organizations.teams[0].$id : undefined);

    // Load projects for the current organization if one is selected
    let projectsCount = 0;
    if (currentOrgId) {
        try {
            projectsCount = (
                await sdk.forConsole.projects.list({
                    queries: [
                        Query.equal('teamId', currentOrgId),
                        Query.limit(1),
                        Query.select(['$id'])
                    ]
                })
            ).total;
        } catch (e) {
            projectsCount = 0;
        }
    }

    return {
        plansInfo,
        roles: [],
        scopes: [],
        preferences,
        currentOrgId,
        organizations,
        consoleVariables,
        version: versionData?.version ?? null,
        allProjectsCount: projectsCount
    };
};

function toPlanMap(plansArray: Models.BillingPlanList | null): Map<string, Models.BillingPlan> {
    const map = new Map<string, Models.BillingPlan>();
    if (!plansArray?.plans.length) return map;

    const plans = plansArray.plans;
    for (let i = 0; i < plans.length; i++) {
        const plan = plans[i];
        map.set(plan.$id, plan);
    }

    return map;
}
