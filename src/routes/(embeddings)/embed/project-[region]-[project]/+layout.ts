import type { LayoutLoad } from './$types';
import { sdk } from '$lib/stores/sdk';

export const load: LayoutLoad = async ({ params }) => {
    const project = await sdk.forConsole.projects.get({ projectId: params.project });
    const organization = await sdk.forConsole.teams.get({ teamId: project.teamId });
    const currentPlan = await sdk.forConsole.billing.getOrganizationPlan(organization.$id);
    const { roles, scopes } = await sdk.forConsole.billing.getRoles(organization.$id);

    return {
        header: null,
        project,
        organization,
        currentPlan,
        roles,
        scopes
    };
};
