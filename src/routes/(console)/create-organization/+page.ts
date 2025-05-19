import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import type { Coupon } from '$lib/sdk/billing';
import type { Organization } from '$lib/stores/organization';
import { BillingPlan } from '@appwrite.io/console';

export const load: PageLoad = async ({ url, parent }) => {
    const { organizations } = await parent();
    const [coupon, paymentMethods] = await Promise.all([
        getCoupon(url),
        sdk.forConsole.account.listPaymentMethods()
    ]);
    let plan = getPlanFromUrl(url);
    const hasFreeOrganizations = organizations.teams?.some(
        (org) => (org as Organization)?.billingPlan === BillingPlan.Tier0
    );
    if (plan === BillingPlan.Tier0 && hasFreeOrganizations) {
        plan = BillingPlan.Tier1;
    }

    return {
        plan,
        coupon,
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
    return BillingPlan.Tier0;
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
