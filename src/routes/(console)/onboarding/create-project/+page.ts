import type { PageLoad } from './$types';
import { isCloud } from '$lib/system';
import { sdk } from '$lib/stores/sdk';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { isOrganization, isOrganizationError, tierToPlan } from '$lib/stores/billing';
import { BillingPlan, ID, Query } from '@appwrite.io/console';
import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';

export const load: PageLoad = async ({ parent }) => {
    const { organizations } = await parent();
    try {
        if (!organizations?.total) {
            try {
                if (isCloud) {
                    const org = await sdk.forConsole.organizations.create(
                        ID.unique(),
                        'Personal projects',
                        BillingPlan.Tier0
                    );
                    trackEvent(Submit.OrganizationCreate, {
                        plan: tierToPlan(BillingPlan.Tier0)?.name,
                        budget_cap_enabled: false,
                        members_invited: 0
                    });

                    if (isOrganization(org)) {
                        return {
                            organization: org,
                            regions: await sdk.forConsole.billing.listRegions(org.$id)
                        };
                    } else if (isOrganizationError(org)) {
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
                        ),
                        regions: null
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
                const regions = isCloud ? await sdk.forConsole.billing.listRegions(org.$id) : null;
                return {
                    organization: org,
                    regions
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
