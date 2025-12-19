import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import { type Models, Platform } from '@appwrite.io/console';
import { BillingPlan, Dependencies } from '$lib/constants';

export const load: PageLoad = async ({ url, parent, depends }) => {
    const { organizations } = await parent();
    depends(Dependencies.ORGANIZATIONS);
    const [coupon, paymentMethods, plans] = await Promise.all([
        getCoupon(url),
        sdk.forConsole.account.listPaymentMethods(),
        sdk.forConsole.console.getPlans({
            platform: Platform.Appwrite
        })
    ]);
    let plan = getPlanFromUrl(url);
    const hasFreeOrganizations = organizations.teams?.some(
        (org) => (org as Models.Organization)?.billingPlan === BillingPlan.FREE
    );

    if (plan === BillingPlan.FREE && hasFreeOrganizations) {
        plan = BillingPlan.PRO;
    }

    return {
        plan,
        coupon,
        plans,
        hasFreeOrganizations,
        paymentMethods,
        name: url.searchParams.get('name') ?? ''
    };
};

function getPlanFromUrl(url: URL): BillingPlan | null {
    if (url.searchParams.has('plan')) {
        const plan = url.searchParams.get('plan');
        if (plan && plan in BillingPlan) {
            return plan as BillingPlan;
        }
    }
    return BillingPlan.FREE;
}

async function getCoupon(url: URL): Promise<Models.Coupon | null> {
    if (url.searchParams.has('code')) {
        const coupon = url.searchParams.get('code');
        try {
            return sdk.forConsole.account.getCoupon({
                couponId: coupon
            });
        } catch (e) {
            return null;
        }
    }
    return null;
}
