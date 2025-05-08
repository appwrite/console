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
import type { Organization } from '$lib/stores/organization';
import { defaultRoles, defaultScopes } from '$lib/constants';
import type { Plan } from '$lib/sdk/billing';

export const load: LayoutLoad = async ({ params, depends }) => {
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
                await failedInvoice.load(params.organization);
                if (get(failedInvoice)) {
                    headerAlert.add({
                        show: true,
                        component: ProjectsAtRisk,
                        id: 'projectsAtRisk',
                        importance: 1
                    });
                }
            }
        }
        const prefs = await sdk.forConsole.account.getPrefs();
        if (prefs.organization !== params.organization) {
            const newPrefs = { ...prefs, organization: params.organization };
            sdk.forConsole.account.updatePrefs(newPrefs);
        }

        const [organization, members] = await Promise.all([
            sdk.forConsole.teams.get(params.organization) as Promise<Organization>,
            sdk.forConsole.teams.listMemberships(params.organization),
            preferences.loadTeamPrefs(params.organization)
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
        const prefs = await sdk.forConsole.account.getPrefs();
        const newPrefs = { ...prefs, organization: null };
        sdk.forConsole.account.updatePrefs(newPrefs);
        error(e.code, e.message);
    }
};
