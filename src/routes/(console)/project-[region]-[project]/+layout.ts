import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { error } from '@sveltejs/kit';
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
import { roles as rolesStore, scopes as scopesStore } from '$lib/stores/roles';
import { organization as orgStore, type Organization } from '$lib/stores/organization';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.PROJECT);
    let currentPlan: Plan = null;
    const orgFromStore: Organization = get(orgStore);

    try {
        const project = await sdk.forConsole.projects.get(params.project);
        const [organization, prefs, regionalConsoleVariables, _] = await Promise.all([
            orgFromStore
                ? (Promise.resolve(orgFromStore) as Promise<Organization>)
                : (sdk.forConsole.teams.get(project.teamId) as Promise<Organization>),
            sdk.forConsole.account.getPrefs(),
            sdk.forConsoleIn(project.region).console.variables(),
            loadAvailableRegions(project.teamId)
        ]);
        if (prefs?.organization !== project.teamId) {
            sdk.forConsole.account.updatePrefs({
                ...prefs,
                organization: project.teamId
            });
        }
        await preferences.loadTeamPrefs(project.teamId);

        // get values from saved stores if available!
        const [rolesStoreValue, scopesStoreValue] = [get(rolesStore), get(scopesStore)];
        const areBothAvailable = !!(rolesStoreValue.length && scopesStoreValue.length);

        let roles = isCloud ? [] : defaultRoles;
        let scopes = isCloud ? [] : defaultScopes;
        if (isCloud) {
            currentPlan = await sdk.forConsole.billing.getOrganizationPlan(project.teamId);
            const res = areBothAvailable
                ? { roles: rolesStoreValue, scopes: scopesStoreValue }
                : await sdk.forConsole.billing.getRoles(project.teamId);
            roles = res.roles;
            scopes = res.scopes;
            if (scopes.includes('billing.read')) {
                loadFailedInvoices(project.teamId);
            }
        }

        return {
            project,
            organization,
            regionalConsoleVariables,
            roles,
            scopes,
            currentPlan
        };
    } catch (e) {
        error(e.code, e.message);
    }
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
