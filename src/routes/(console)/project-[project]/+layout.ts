import PaymentFailed from '$lib/components/billing/alerts/paymentFailed.svelte';
import { defaultRoles, defaultScopes, Dependencies } from '$lib/constants';
import type { Plan } from '$lib/sdk/billing';
import { failedInvoice } from '$lib/stores/billing';
import { headerAlert } from '$lib/stores/headerAlert';
import type { Organization } from '$lib/stores/organization';
import { preferences } from '$lib/stores/preferences';
import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.PROJECT);
    let currentPlan: Plan = null;

    try {
        const project = await sdk.forConsole.projects.get(params.project);
        const [organization, prefs] = await Promise.all([
            sdk.forConsole.teams.get(project.teamId) as Promise<Organization>,
            sdk.forConsole.account.getPrefs()
        ]);
        if (prefs?.organization !== project.teamId) {
            sdk.forConsole.account.updatePrefs({
                ...prefs,
                organization: project.teamId
            });
        }
        preferences.loadTeamPrefs(project.teamId);
        let roles = isCloud ? [] : defaultRoles;
        let scopes = isCloud ? [] : defaultScopes;
        if (isCloud) {
            currentPlan = await sdk.forConsole.billing.getOrganizationPlan(project.teamId);
            const res = await sdk.forConsole.organizations.getScopes(project.teamId);
            roles = res.roles;
            scopes = res.scopes;
            if (scopes.includes('billing.read')) {
                await failedInvoice.load(project.teamId);
                if (get(failedInvoice)) {
                    headerAlert.add({
                        show: true,
                        component: PaymentFailed,
                        id: 'paymentFailed',
                        importance: 1
                    });
                }
            }
        }

        return {
            project,
            organization,
            roles,
            scopes,
            currentPlan
        };
    } catch (e) {
        error(e.code, e.message);
    }
};
