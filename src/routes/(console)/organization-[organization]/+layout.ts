import { Dependencies } from '$lib/constants';
import { failedInvoice } from '$lib/stores/billing';
import { isCloud } from '$lib/system';
import { sdk } from '$lib/stores/sdk';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { headerAlert } from '$lib/stores/headerAlert';
import ProjectsAtRisk from '$lib/components/billing/alerts/projectsAtRisk.svelte';
import { get } from 'svelte/store';
import { preferences } from '$lib/stores/preferences';
import { defaultRoles, defaultScopes } from '$lib/constants';
import type { Plan } from '$lib/sdk/billing';
import { loadAvailableRegions } from '$routes/(console)/regions';
import type { Organization } from '$lib/stores/organization';

export const load: LayoutLoad = async ({ params, depends, parent }) => {
    const { preferences: prefs } = await parent();

    depends(Dependencies.ORGANIZATION);
    depends(Dependencies.MEMBERS);
    depends(Dependencies.PAYMENT_METHODS);
    let roles = isCloud ? [] : defaultRoles;
    let scopes = isCloud ? [] : defaultScopes;
    let currentPlan: Plan = null;

    try {
        if (isCloud) {
            const res = await sdk.forConsole.billing.getRoles(params.organization);
            roles = res.roles;
            scopes = res.scopes;
            currentPlan = await sdk.forConsole.billing.getOrganizationPlan(params.organization);
            if (scopes.includes('billing.read')) {
                loadFailedInvoices(params.organization);
            }
        }
        if (prefs.organization !== params.organization) {
            const newPrefs = { ...prefs, organization: params.organization };
            void sdk.forConsole.account.updatePrefs(newPrefs);
        }

        const [organization, members] = await Promise.all([
            sdk.forConsole.teams.get(params.organization) as Promise<Organization>,
            sdk.forConsole.teams.listMemberships(params.organization),
            preferences.loadTeamPrefs(params.organization),
            loadAvailableRegions(params.organization)
        ]);

        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            organization,
            currentPlan,
            members,
            roles,
            scopes
        };
    } catch (e) {
        const newPrefs = { ...prefs, organization: null };
        void sdk.forConsole.account.updatePrefs(newPrefs);
        error(e.code, e.message);
    }
};

// load the invoice and add a banner in bg
function loadFailedInvoices(teamId: string) {
    failedInvoice.load(teamId).then(() => {
        if (get(failedInvoice)) {
            headerAlert.add({
                show: true,
                component: ProjectsAtRisk,
                id: 'projectsAtRisk',
                importance: 1
            });
        }
    });
}
