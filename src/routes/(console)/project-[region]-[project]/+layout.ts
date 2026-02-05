import { defaultRoles, defaultScopes, Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import type { LayoutLoad } from './$types';
import { preferences } from '$lib/stores/preferences';
import { failedInvoice } from '$lib/stores/billing';
import { isCloud } from '$lib/system';
import { get } from 'svelte/store';
import { headerAlert } from '$lib/stores/headerAlert';
import PaymentFailed from '$lib/components/billing/alerts/paymentFailed.svelte';
import { loadAvailableRegions } from '$routes/(console)/regions';
import { type Models, Platform } from '@appwrite.io/console';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { generateFingerprintToken } from '$lib/helpers/fingerprint';
import { normalizeConsoleVariables } from '$lib/helpers/domains';

export const load: LayoutLoad = async ({ params, depends, parent }) => {
    const { plansInfo, organizations, preferences: prefs } = await parent();
    depends(Dependencies.PROJECT);

    const project = await sdk.forConsole.projects.get({ projectId: params.project });
    project.region ??= 'default';

    // fast path without a network call!
    let organization = (organizations as Models.OrganizationList)?.teams?.find(
        (org) => org.$id === project.teamId
    );

    // organization can be null if not in the filtered list!
    const includedInBasePlans = plansInfo.has(organization?.billingPlanId);

    const [org, rawRegionalConsoleVariables, rolesResult] = await Promise.all([
        !organization
            ? // TODO: @itznotabug - teams.get with Models.Organization?
              (sdk.forConsole.teams.get({ teamId: project.teamId }) as Promise<Models.Organization>)
            : organization,
        sdk.forConsoleIn(project.region).console.variables(),
        isCloud
            ? sdk.forConsole.organizations.getScopes({
                  organizationId: project.teamId
              })
            : null,

        loadAvailableRegions(project.teamId)
    ]);

    const regionalConsoleVariables = normalizeConsoleVariables(rawRegionalConsoleVariables);

    if (!organization) organization = org;

    // not the right organization project based on platform,
    // redirect to organization, and it should handle the rest!
    if (isCloud && organization.platform !== Platform.Appwrite) {
        redirect(
            303,
            resolve('/(console)/organization-[organization]', {
                organization: organization.$id
            })
        );
    }

    // fetch if not available in `plansInfo`.
    // out of promise.all because we filter orgs based on platform now!
    const organizationPlan = includedInBasePlans
        ? plansInfo.get(organization?.billingPlanId)
        : isCloud
          ? await sdk.forConsole.organizations.getPlan({
                organizationId: organization?.$id
            })
          : null;

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
        plansInfo.set(organization.billingPlanId, organizationPlan);
    }

    // Track console access for cloud only (fire-and-forget, backend has 6-day cooldown)
    // Don't call if project is paused - user must explicitly resume via createConsoleAccess
    if (isCloud) {
        const projectInactivityDays = organizationPlan?.projectInactivityDays ?? 0;
        const consoleAccessedAt = (project as { consoleAccessedAt?: string }).consoleAccessedAt;

        let isPaused = false;
        if (projectInactivityDays > 0 && consoleAccessedAt) {
            const lastAccess = new Date(consoleAccessedAt);
            const now = new Date();
            const diffDays = Math.floor((now.getTime() - lastAccess.getTime()) / (1000 * 60 * 60 * 24));
            isPaused = diffDays >= projectInactivityDays;
        }

        if (!isPaused) {
            generateFingerprintToken()
                .then((fingerprint) => {
                    sdk.forConsole.client.headers['X-Appwrite-Console-Fingerprint'] = fingerprint;
                    return sdk.forConsole.projects.updateConsoleAccess({ projectId: params.project });
                })
                .catch(() => {});
        }
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
