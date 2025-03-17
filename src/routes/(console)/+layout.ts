import { Dependencies } from '$lib/constants';
import type { Plan } from '$lib/sdk/billing';
import type { Tier } from '$lib/stores/billing';
import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import type { LayoutLoad } from './$types';
import { Query } from '@appwrite.io/console';

export const load: LayoutLoad = async ({ params, fetch, depends, parent }) => {
    await parent();
    depends(Dependencies.RUNTIMES);
    depends(Dependencies.CONSOLE_VARIABLES);
    depends(Dependencies.ORGANIZATION);

    const prefs = await sdk.forConsole.account.getPrefs();

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

    const organizations = !isCloud
        ? await sdk.forConsole.teams.list()
        : await sdk.forConsole.billing.listOrganization();

    let projects = [];
    let currentOrgId = params.organization ? params.organization : prefs.organization;

    if (!currentOrgId && organizations.teams.length > 0) {
        currentOrgId = organizations.teams[0].$id;
    }
    if (currentOrgId) {
        const orgProjects = await sdk.forConsole.projects.list([
            Query.equal('teamId', currentOrgId),
            Query.limit(100),
            Query.orderDesc('$updatedAt')
        ]);
        projects = orgProjects.projects.length > 0 ? orgProjects.projects : [];
    }

    return {
        consoleVariables: variables,
        version: data?.version ?? null,
        plansInfo,
        roles: [],
        scopes: [],
        projects: projects,
        currentProjectId: params.project ?? '',
        organizations: organizations
    };
};
