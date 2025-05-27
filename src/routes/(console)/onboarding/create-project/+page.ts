import type { PageLoad } from './$types';
import { isCloud } from '$lib/system';
import { sdk } from '$lib/stores/sdk';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { isOrganization, tierToPlan } from '$lib/stores/billing';
import { ID, Query } from '@appwrite.io/console';
import { BillingPlan } from '$lib/constants';
import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';

// TODO: this needs to be cleaned up!
export const load: PageLoad = async ({ parent }) => {
    const { organizations } = await parent();

    try {
        if (!organizations?.total) {
            try {
                if (isCloud) {
                    const org = await sdk.forConsole.billing.createOrganization(
                        ID.unique(),
                        'Personal projects',
                        BillingPlan.FREE,
                        null,
                        null
                    );
                    trackEvent(Submit.OrganizationCreate, {
                        plan: tierToPlan(BillingPlan.FREE)?.name,
                        budget_cap_enabled: false,
                        members_invited: 0
                    });

                    if (isOrganization(org)) {
                        return {
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
                        organization: await sdk.forConsole.teams.create(
                            ID.unique(),
                            'Personal projects'
                        )
                    };
                }
            } catch (e) {
                trackError(e, Submit.OrganizationCreate);
            }
        } else if (organizations?.total === 1) {
            const org = organizations.teams[0];
            const projects = await sdk.forConsole.projects.list([
                Query.equal('teamId', org.$id),
                Query.limit(1)
            ]);
            if (!projects.total) {
                return {
                    organization: org
                };
            } else {
                redirect(303, `${base}/console/organization-${org.$id}`);
            }
        } else {
            redirect(303, `${base}/console/organization-${organizations.teams[0].$id}`);
        }
    } catch (error) {
        console.error(error);
    }
};
