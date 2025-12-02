import { BillingPlan, Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import type { Coupon } from '$lib/sdk/billing';
import type { Organization } from '$lib/stores/organization';
import { ProfileMode, resolvedProfile } from '$lib/profiles/index.svelte';
import { ID } from '@appwrite.io/console';
import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';

export const load: PageLoad = async ({ url, parent, depends }) => {
    const { organizations } = await parent();
    if (resolvedProfile.id === ProfileMode.STUDIO) {
        if (organizations.total === 0) {
            const org = await sdk.forConsole.organizations.create({
                organizationId: ID.unique(),
                name: 'Personal projects',
                billingPlan: resolvedProfile.freeTier,
                platform: resolvedProfile.organizationPlatform
            });
            redirect(
                303,
                resolve('/(console)/organization-[organization]', {
                    organization: org.$id
                })
            );
        }
    }
    depends(Dependencies.ORGANIZATIONS);
    const [coupon, paymentMethods, plans] = await Promise.all([
        getCoupon(url),
        sdk.forConsole.billing.listPaymentMethods(),
        sdk.forConsole.billing.listPlans()
    ]);
    let plan = getPlanFromUrl(url);
    const hasFreeOrganizations = organizations.teams?.some(
        (org) => (org as Organization)?.billingPlan === BillingPlan.FREE
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

async function getCoupon(url: URL): Promise<Coupon | null> {
    if (url.searchParams.has('code')) {
        const coupon = url.searchParams.get('code');
        try {
            return sdk.forConsole.billing.getCouponAccount(coupon);
        } catch (e) {
            return null;
        }
    }
    return null;
}
