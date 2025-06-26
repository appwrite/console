import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import type { LayoutLoad } from './$types';
import { preferences } from '$lib/stores/preferences';
import { failedInvoice } from '$lib/stores/billing';
import { isCloud } from '$lib/system';
import { defaultRoles, defaultScopes } from '$lib/constants';
import { get } from 'svelte/store';
import { headerAlert } from '$lib/stores/headerAlert';
import PaymentFailed from '$lib/components/billing/alerts/paymentFailed.svelte';
import { loadAvailableRegions } from '$routes/(console)/regions';
import type { Organization, OrganizationList } from '$lib/stores/organization';

export const load: LayoutLoad = async ({ params, depends, parent }) => {
    const { plansInfo, organizations, preferences: prefs } = await parent();
    depends(Dependencies.PROJECT);

    const project = await sdk.forConsole.projects.get(params.project);

    // fast path without a network call!
    let organization = (organizations as OrganizationList)?.teams?.find(
        (org) => org.$id === project.teamId
    );

    const includedInBasePlans = plansInfo.has(organization.billingPlan);

    const [org, regionalConsoleVariables, rolesResult, organizationPlan] = await Promise.all([
        !organization
            ? (sdk.forConsole.teams.get(project.teamId) as Promise<Organization>)
            : organization,
        sdk.forConsoleIn(project.region).console.variables(),
        isCloud ? sdk.forConsole.billing.getRoles(project.teamId) : null,

        // fetch if not available in `plansInfo`
        includedInBasePlans
            ? plansInfo.get(organization.billingPlan)
            : sdk.forConsole.billing.getOrganizationPlan(organization.$id),

        loadAvailableRegions(project.teamId)
    ]);

    if (!organization) organization = org;

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

    if (!includedInBasePlans) {
        // save the custom plan to `plansInfo` cache.
        plansInfo.set(organization.billingPlan, organizationPlan);
    }

    return {
        project,
        organization,
        regionalConsoleVariables,
        roles,
        scopes,
        currentPlan: organizationPlan
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
