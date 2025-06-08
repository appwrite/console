import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import type { LayoutLoad } from './$types';
import { preferences } from '$lib/stores/preferences';
import { failedInvoice } from '$lib/stores/billing';
import { isCloud } from '$lib/system';
import { defaultRoles, defaultScopes } from '$lib/constants';
import type { Plan } from '$lib/sdk/billing';
import { get } from 'svelte/store';
import { headerAlert } from '$lib/stores/headerAlert';
import PaymentFailed from '$lib/components/billing/alerts/paymentFailed.svelte';
import { loadAvailableRegions } from '$routes/(console)/regions';
import type { Organization, OrganizationList } from '$lib/stores/organization';

export const load: LayoutLoad = async ({ params, depends, parent }) => {
    const { organizations } = await parent();
    depends(Dependencies.PROJECT);

    const project = await sdk.forConsole.projects.get(params.project);
    // fast path without a network call!
    let organization = (organizations as OrganizationList)?.teams?.find(
        (org) => org.$id === project.teamId
    );

    const [org, prefs, regionalConsoleVariables, rolesResult, planResult] = await Promise.all([
        !organization
            ? (sdk.forConsole.teams.get(project.teamId) as Promise<Organization>)
            : organization,
        sdk.forConsole.account.getPrefs(),
        sdk.forConsoleIn(project.region).console.variables(),
        isCloud ? sdk.forConsole.billing.getRoles(project.teamId) : null,
        isCloud ? sdk.forConsole.billing.getOrganizationPlan(project.teamId) : null,
        loadAvailableRegions(project.teamId)
    ]);

    if (!organization) organization = org;

    const currentPlan: Plan = planResult;
    const roles = rolesResult?.roles ?? defaultRoles;
    const scopes = rolesResult?.scopes ?? defaultScopes;

    if (prefs?.organization !== project.teamId) {
        sdk.forConsole.account.updatePrefs({
            ...prefs,
            organization: project.teamId
        });
    }

    preferences.loadTeamPrefs(project.teamId);

    if (isCloud && scopes.includes('billing.read')) {
        loadFailedInvoices(project.teamId);
    }

    return {
        project,
        organization,
        regionalConsoleVariables,
        roles,
        scopes,
        currentPlan
    };
};

// load the invoice and add a banner in bg
function loadFailedInvoices(teamId: string) {
    failedInvoice.load(teamId).then(() => {
        if (get(failedInvoice)) {
            headerAlert.add({
                show: true,
                component: PaymentFailed,
                id: 'paymentFailed',
                importance: 1
            });
        }
    });
}
