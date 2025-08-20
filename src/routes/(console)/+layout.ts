import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import type { LayoutLoad } from './$types';
import { Dependencies } from '$lib/constants';
import type { Tier } from '$lib/stores/billing';
import type { Plan, PlanList } from '$lib/sdk/billing';
import { Query } from '@appwrite.io/console';

export const load: LayoutLoad = async ({ depends, parent }) => {
    const { organizations } = await parent();

    depends(Dependencies.RUNTIMES);
    depends(Dependencies.CONSOLE_VARIABLES);
    depends(Dependencies.ORGANIZATION);

    const { endpoint, project } = sdk.forConsole.client.config;
    const [preferences, plansArray, versionData, consoleVariables] = await Promise.all([
        sdk.forConsole.account.getPrefs(),
        isCloud ? sdk.forConsole.billing.getPlansInfo() : null,
        fetch(`${endpoint}/health/version`, {
            headers: { 'X-Appwrite-Project': project }
        }).then((response) => response.json() as { version?: string }),
        sdk.forConsole.console.variables()
    ]);

    const plansInfo = toPlanMap(plansArray);

    const currentOrgId =
        preferences.organization ??
        (organizations.teams.length > 0 ? organizations.teams[0].$id : undefined);

    // Load projects for the current organization if one is selected
    let projects = null;
    if (currentOrgId) {
        try {
            projects = await sdk.forConsole.projects.list([
                Query.equal('teamId', currentOrgId),
                Query.limit(1000) // Get all projects for organization
            ]);
            for (const project of projects.projects) {
                project.region ??= 'default';
            }
        } catch (e) {
            // Handle error silently - projects might not be accessible
            projects = {};
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
        allProjects: projects
    };
};

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
