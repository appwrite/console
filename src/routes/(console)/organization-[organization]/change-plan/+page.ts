import type { PageLoad } from './$types';
import type { Organization } from '$lib/stores/organization';
import { BillingPlan, Dependencies } from '$lib/constants';

export const load: PageLoad = async ({ depends, parent }) => {
    const { members, currentPlan, organizations } = await parent();
    depends(Dependencies.UPGRADE_PLAN);

    let plan: BillingPlan;

    if (currentPlan?.$id === BillingPlan.SCALE) {
        plan = BillingPlan.SCALE;
    } else {
        plan = BillingPlan.PRO;
    }

    const selfService = currentPlan?.selfService ?? true;
    const hasFreeOrgs = organizations.teams?.some(
        (org) => (org as Organization)?.billingPlan === BillingPlan.FREE
    );

    return {
        members,
        plan,
        selfService,
        hasFreeOrgs
    };
};
