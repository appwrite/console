import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import type { Coupon } from '$lib/sdk/billing';
import type { Organization } from '$lib/stores/organization';
import { BillingPlan } from '@appwrite.io/console';

export const load: PageLoad = async ({ depends, parent, url }) => {
    const { members, organization, currentPlan, organizations } = await parent();
    depends(Dependencies.UPGRADE_PLAN);

    const [coupon, paymentMethods] = await Promise.all([
        getCoupon(url),
        sdk.forConsole.account.listPaymentMethods()
    ]);

    let plan = getPlanFromUrl(url);

    if (organization?.billingPlan === BillingPlan.Tier2) {
        plan = BillingPlan.Tier2;
    } else {
        plan = BillingPlan.Tier1;
    }

    const selfService = currentPlan?.selfService ?? true;
    const hasFreeOrgs = organizations.teams?.some(
        (org) => (org as Organization)?.billingPlan === BillingPlan.Tier0
    );

    return {
        members,
        plan,
        coupon,
        selfService,
        hasFreeOrgs,
        paymentMethods
    };
};

function getPlanFromUrl(url: URL): BillingPlan | null {
    if (url.searchParams.has('plan')) {
        const plan = url.searchParams.get('plan');
        if (plan && plan in BillingPlan) {
            return plan as BillingPlan;
        }
    }
}

async function getCoupon(url: URL): Promise<Coupon | null> {
    if (url.searchParams.has('code')) {
        const coupon = url.searchParams.get('code');
        try {
            return sdk.forConsole.console.getCoupon(coupon);
        } catch (e) {
            return null;
        }
    }
    return null;
}
