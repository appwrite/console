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
import { redirect } from '@sveltejs/kit';
import { resolvedProfile } from '$lib/profiles/index.svelte';
import { resolve } from '$app/paths';

function checkServiceAccess(routeId: string | null, params: { region: string; project: string }) {
    if (!routeId) return;

    const serviceName = Object.keys(resolvedProfile.services).find((service) =>
        routeId.includes(`/${service}`)
    );

    if (
        serviceName &&
        serviceName !== 'studio' /* for avoiding looped redirects */ &&
        resolvedProfile.services[serviceName as keyof typeof resolvedProfile.services] === false
    ) {
        redirect(
            302,
            resolve('/(console)/project-[region]-[project]/(studio)/studio', {
                region: params.region,
                project: params.project
            })
        );
    }
}

export const load: LayoutLoad = async ({ params, route, depends, parent }) => {
    const { plansInfo, organizations, preferences: prefs } = await parent();
    depends(Dependencies.PROJECT);

    checkServiceAccess(route.id, params);

    const project = await sdk.forConsole.projects.get({ projectId: params.project });
    project.region ??= 'default';

    // fast path without a network call!
    let organization = (organizations as OrganizationList)?.teams?.find(
        (org) => org.$id === project.teamId
    );

    const includedInBasePlans = plansInfo.has(organization.billingPlan);

    const [org, regionalConsoleVariables, rolesResult, organizationPlan] = await Promise.all([
        !organization
            ? (sdk.forConsole.teams.get({ teamId: project.teamId }) as Promise<Organization>)
            : organization,
        sdk.forConsoleIn(project.region).console.variables(),
        isCloud ? sdk.forConsole.billing.getRoles(project.teamId) : null,

        // fetch if not available in `plansInfo`
        includedInBasePlans
            ? plansInfo.get(organization.billingPlan)
            : isCloud
              ? sdk.forConsole.billing.getOrganizationPlan(organization.$id)
              : null,

        loadAvailableRegions(project.teamId)
    ]);

    if (!organization) organization = org;

    const roles = rolesResult?.roles ?? defaultRoles;
    const scopes = rolesResult?.scopes ?? defaultScopes;

    if (prefs?.organization !== project.teamId) {
        sdk.forConsole.account.updatePrefs({
            prefs: {
                ...prefs,
                organization: project.teamId
            }
        });
    }

    // should be awaited for `displayNames`!
    await preferences.loadTeamPrefs(project.teamId);

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
