import { Dependencies } from '$lib/constants';
import { failedInvoice } from '$lib/stores/billing';
import { isCloud } from '$lib/system';
import { sdk } from '$lib/stores/sdk';
import { error, redirect } from '@sveltejs/kit';
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
import { resolvedProfile } from '$lib/profiles/index.svelte';
import { resolve } from '$app/paths';

export const load: LayoutLoad = async ({ params, depends, parent }) => {
    const { organizations, preferences: prefs } = await parent();

    depends(Dependencies.ORGANIZATION);
    depends(Dependencies.MEMBERS);
    depends(Dependencies.PAYMENT_METHODS);

    const requestedOrg = await checkPlatformAndRedirect(params, organizations, prefs);

    let roles = isCloud ? [] : defaultRoles;
    let scopes = isCloud ? [] : defaultScopes;
    let currentPlan: Plan = null;

    try {
        if (isCloud) {
            [{ roles, scopes }, currentPlan] = await Promise.all([
                sdk.forConsole.billing.getRoles(params.organization),
                sdk.forConsole.billing.getOrganizationPlan(params.organization)
            ]);

            if (scopes.includes('billing.read')) {
                loadFailedInvoices(params.organization);
            }
        }

        if (prefs[resolvedProfile.organizationPrefKey] !== params.organization) {
            const newPrefs = {
                ...prefs,
                [resolvedProfile.organizationPrefKey]: params.organization
            };
            sdk.forConsole.account.updatePrefs({ prefs: newPrefs });
        }

        // fetch org only if we haven't already fetched it for platform check
        const orgPromise: Promise<Organization> = requestedOrg
            ? Promise.resolve(requestedOrg)
            : (sdk.forConsole.teams.get({ teamId: params.organization }) as Promise<Organization>);

        const [org, members, countryList, locale] = await Promise.all([
            orgPromise,
            sdk.forConsole.teams.listMemberships({ teamId: params.organization }),
            sdk.forConsole.locale.listCountries(),
            sdk.forConsole.locale.get(),
            preferences.loadTeamPrefs(params.organization),
            loadAvailableRegions(params.organization)
        ]);

        const seatsAddon = currentPlan?.addons?.seats;
        const canAddMembers =
            !seatsAddon || (seatsAddon.supported ?? false) || (seatsAddon.limit ?? 0) > 1;

        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            organization: org,
            currentPlan,
            members,
            roles,
            scopes,
            countryList,
            locale,
            supportsMoreMembers: canAddMembers
        };
    } catch (e) {
        const newPrefs = {
            ...prefs,
            [resolvedProfile.organizationPrefKey]: null
        };

        sdk.forConsole.account.updatePrefs({
            prefs: newPrefs
        });
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

async function checkPlatformAndRedirect(
    params: { organization: string },
    organizations: { teams: Organization[] },
    prefs: Record<string, string>
): Promise<Organization | null> {
    // check if preloaded
    let requestedOrg = organizations.teams.find((team) => team.$id === params.organization) as
        | Organization
        | undefined;

    // not found, load!
    if (!requestedOrg) {
        try {
            requestedOrg = (await sdk.forConsole.teams.get({
                teamId: params.organization
            })) as Organization;
        } catch (e) {
            return null;
        }
    }

    if (!isCloud) return requestedOrg;

    if (requestedOrg && requestedOrg.platform !== resolvedProfile.organizationPlatform) {
        const orgIdInPrefs = prefs[resolvedProfile.organizationPrefKey];

        // grab the first org with matching platform
        const samePlatformOrganization = organizations.teams.find(
            (team) => team.platform === resolvedProfile.organizationPlatform
        );

        // exists, lets redirect!
        if (samePlatformOrganization) {
            redirect(
                303,
                resolve('/(console)/organization-[organization]', {
                    organization: samePlatformOrganization.$id
                })
            );
        }
        // not in list, check prefs
        else if (orgIdInPrefs) {
            try {
                // check if exists and is valid
                const orgFromPrefs = (await sdk.forConsole.teams.get({
                    teamId: orgIdInPrefs
                })) as Organization;

                // exists and is valid, redirect
                redirect(
                    303,
                    resolve('/(console)/organization-[organization]', {
                        organization: orgFromPrefs.$id
                    })
                );
            } catch (e) {
                redirect(303, resolve('/(console)'));
            }
        } else {
            redirect(303, resolve('/(console)'));
        }
    }

    // send the org,
    // if already in the full list so we don't have to make another API request.
    return requestedOrg;
}
