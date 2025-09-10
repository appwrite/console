import { BillingPlan, Dependencies } from '$lib/constants';
import type { Address } from '$lib/sdk/billing';
import { type Organization } from '$lib/stores/organization';
import { sdk } from '$lib/stores/sdk';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { isCloud } from '$lib/system';

import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';

export const load: PageLoad = async ({ parent, depends, url, route }) => {
    const { organization, scopes, currentPlan, countryList, locale } = await parent();

    if (!scopes.includes('billing.read')) {
        return redirect(301, `/console/organization-${organization.$id}`);
    }

    depends(Dependencies.PAYMENT_METHODS);
    depends(Dependencies.ORGANIZATION);
    depends(Dependencies.CREDIT);
    depends(Dependencies.INVOICES);
    depends(Dependencies.ADDRESS);
    //aggregation reloads on page param changes
    depends('billing:aggregation');

    const billingAddressId = (organization as Organization)?.billingAddressId;
    const billingAddressPromise: Promise<Address> = billingAddressId
        ? sdk.forConsole.billing
              .getOrganizationBillingAddress(organization.$id, billingAddressId)
              .catch(() => null)
        : null;

    /**
     * Needed to keep this out of Promise.all, as when organization is
     * initially created, these might return 404
     * - can be removed later once that is fixed in back-end
     */
    let billingAggregation = null;
    try {
        const currentPage = getPage(url) || 1;
        const limit = getLimit(url, route, 5);
        const offset = pageToOffset(currentPage, limit);
        billingAggregation = await sdk.forConsole.billing.getAggregation(
            organization.$id,
            (organization as Organization)?.billingAggregationId,
            limit,
            offset
        );
    } catch (e) {
        // ignore error
    }

    let billingInvoice = null;
    try {
        billingInvoice = await sdk.forConsole.billing.getInvoice(
            organization.$id,
            (organization as Organization)?.billingInvoiceId
        );
    } catch (e) {
        // ignore error
    }

    const areCreditsSupported = isCloud
        ? (currentPlan?.supportsCredits ??
          (organization.billingPlan !== BillingPlan.FREE &&
              organization?.billingPlan !== BillingPlan.GITHUB_EDUCATION))
        : false;

    const [paymentMethods, addressList, billingAddress, availableCredit, billingPlanDowngrade] =
        await Promise.all([
            sdk.forConsole.billing.listPaymentMethods(),
            sdk.forConsole.billing.listAddresses(),
            billingAddressPromise,
            areCreditsSupported
                ? sdk.forConsole.billing.getAvailableCredit(organization.$id)
                : null,
            organization.billingPlanDowngrade
                ? sdk.forConsole.billing.getPlan(organization.billingPlanDowngrade)
                : null
        ]);

    // make number
    const credits = availableCredit ? availableCredit.available : null;

    return {
        paymentMethods,
        addressList,
        billingAddress,
        availableCredit: credits,
        billingAggregation,
        billingInvoice,
        areCreditsSupported,
        countryList,
        locale,
        nextPlan: billingPlanDowngrade,
        // expose pagination for components
        limit: getLimit(url, route, 5),
        offset: pageToOffset(getPage(url) || 1, getLimit(url, route, 5)),
        // unique key to force component refresh on page change
        aggregationKey: `agg:${getPage(url) || 1}:${getLimit(url, route, 5)}`
    };
};
