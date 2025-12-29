import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import { BillingPlanGroup, type Models, Platform } from '@appwrite.io/console';
import { Dependencies } from '$lib/constants';
import { billingIdToPlan, getNextTierBillingPlan } from '$lib/stores/billing';

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

    let plan = await getPlanFromUrl(url);
    const hasFreeOrganizations = organizations.teams?.some((org) => {
        const organization = org as Models.Organization;
        return organization.billingPlanDetails.group === BillingPlanGroup.Starter;
    });

    if (plan?.group === BillingPlanGroup.Starter && hasFreeOrganizations) {
        plan = getNextTierBillingPlan(plan?.$id);
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

async function getPlanFromUrl(url: URL): Promise<Models.BillingPlan | null> {
    if (url.searchParams.has('plan')) {
        const planId = url.searchParams.get('plan');
        // check if available in cache, if not, fetch from API.
        return getPlanFromCache(planId) ?? (await sdk.forConsole.console.getPlan({ planId }));
    }

    // fallback
    // @todo: avoid hardcoded maybe
    return await sdk.forConsole.console.getPlan({ planId: 'tier-0' });
}

function getPlanFromCache(plan: string): Models.BillingPlan | null {
    try {
        return billingIdToPlan(plan);
    } catch (error) {
        return null;
    }
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
