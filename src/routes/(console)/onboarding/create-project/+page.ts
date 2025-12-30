import type { PageLoad } from './$types';
import { isCloud } from '$lib/system';
import { sdk } from '$lib/stores/sdk';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { getBasePlanFromGroup, isPaymentAuthenticationRequired } from '$lib/stores/billing';
import { BillingPlanGroup, ID, type Models, Query } from '@appwrite.io/console';
import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';

// TODO: this needs to be cleaned up!
export const load: PageLoad = async ({ parent }) => {
    const { account, organizations } = await parent();

    const accountPrefs = account.prefs;
    const hasCompletedOnboarding = accountPrefs['newOnboardingCompleted'] ?? false;

    // user has already seen it, lets redirect now!
    if (hasCompletedOnboarding && !organizations?.total) {
        redirect(303, `${base}/onboarding/create-organization`);
    } else if (hasCompletedOnboarding && organizations?.total) {
        redirect(303, `${base}/organization-${organizations.teams[0].$id}`);
    }

    if (!organizations?.total) {
        try {
            if (isCloud) {
                const starterPlan = getBasePlanFromGroup(BillingPlanGroup.Starter);
                const org = await sdk.forConsole.organizations.create({
                    organizationId: ID.unique(),
                    name: 'Personal projects',
                    billingPlan: starterPlan.$id
                });
                trackEvent(Submit.OrganizationCreate, {
                    plan: starterPlan?.name,
                    budget_cap_enabled: false,
                    members_invited: 0
                });

                if (!isPaymentAuthenticationRequired(org)) {
                    return {
                        accountPrefs,
                        organization: org
                    };
                } else {
                    const e = new Error(org.message, {
                        cause: org
                    });
                    trackError(e, Submit.OrganizationCreate);
                }
            } else {
                return {
                    accountPrefs,
                    organization: await sdk.forConsole.teams.create({
                        teamId: ID.unique(),
                        name: 'Personal projects'
                    })
                };
            }
        } catch (e) {
            trackError(e, Submit.OrganizationCreate);
        }
    } else if (organizations?.total === 1) {
        const org = organizations.teams[0];
        let projects: Models.ProjectList = null;
        try {
            projects = await sdk.forConsole.projects.list({
                queries: [Query.equal('teamId', org.$id), Query.limit(1), Query.select(['$id'])]
            });
        } catch (e) {
            redirect(303, `${base}/organization-${org.$id}`);
        }
        if (!projects?.total) {
            return {
                accountPrefs,
                organization: org
            };
        } else {
            redirect(303, `${base}/organization-${org.$id}`);
        }
    } else {
        redirect(303, `${base}/organization-${organizations.teams[0].$id}`);
    }
};
