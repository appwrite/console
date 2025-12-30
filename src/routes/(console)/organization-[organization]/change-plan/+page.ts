import type { PageLoad } from './$types';
import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { BillingPlanGroup, type Models, Platform } from '@appwrite.io/console';
import { getBasePlanFromGroup } from '$lib/stores/billing';

export const load: PageLoad = async ({ depends, parent }) => {
    const { members, currentPlan, organizations } = await parent();

    depends(Dependencies.UPGRADE_PLAN);

    let plans: Models.BillingPlanList;

    try {
        plans = await sdk.forConsole.console.getPlans({
            platform: Platform.Appwrite
        });
    } catch (error) {
        console.error('Failed to load billing plans:', error);
        plans = {
            total: 0,
            plans: []
        };
    }

    let plan: Models.BillingPlan;

    const pro = getBasePlanFromGroup(BillingPlanGroup.Pro);
    const scale = getBasePlanFromGroup(BillingPlanGroup.Scale);

    if (currentPlan?.group === BillingPlanGroup.Scale) {
        plan = scale;
    } else {
        plan = pro;
    }

    const selfService = currentPlan?.selfService ?? true;
    const hasFreeOrgs = organizations.teams?.some(
        (org) =>
            (org as Models.Organization)?.billingPlan ===
            getBasePlanFromGroup(BillingPlanGroup.Starter).$id
    );

    return {
        members,
        plan,
        plans,
        selfService,
        hasFreeOrgs
    };
};
