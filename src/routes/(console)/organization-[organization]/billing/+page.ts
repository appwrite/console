import { resolve } from '$app/paths';
import { isCloud } from '$lib/system';
import { sdk } from '$lib/stores/sdk';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { DEFAULT_BILLING_PROJECTS_LIMIT, Dependencies } from '$lib/constants';

import type { Models } from '@appwrite.io/console';
import { getLimit, getPage, pageToOffset } from '$lib/helpers/load';

export const load: PageLoad = async ({ parent, depends, url, route }) => {
    const { organization, scopes, currentPlan, countryList, locale } = await parent();

    if (!scopes.includes('billing.read')) {
        return redirect(
            302,
            resolve('/(console)/organization-[organization]', {
                organization: organization.$id
            })
        );
    }

    depends(Dependencies.PAYMENT_METHODS);
    depends(Dependencies.ORGANIZATION);
    depends(Dependencies.CREDIT);
    depends(Dependencies.INVOICES);
    depends(Dependencies.ADDRESS);
    // aggregation reloads on page param changes
    depends(Dependencies.BILLING_AGGREGATION);

    const billingAddressId = (organization as Models.Organization)?.billingAddressId;
    const billingAddressPromise: Promise<Models.BillingAddress> = billingAddressId
        ? sdk.forConsole.organizations
              .getBillingAddress({
                  organizationId: organization.$id,
                  billingAddressId
              })
              .catch(() => null)
        : null;

    /**
     * Needed to keep this out of Promise.all, as when organization is
     * initially created, these might return 404
     * - can be removed later once that is fixed in back-end
     */
    let billingAggregation: Models.AggregationTeam | null = null;
    try {
        const currentPage = getPage(url) || 1;
        const limit = getLimit(url, route, DEFAULT_BILLING_PROJECTS_LIMIT);
        const offset = pageToOffset(currentPage, limit);
        billingAggregation = await sdk.forConsole.organizations.getAggregation({
            organizationId: organization.$id,
            aggregationId: (organization as Models.Organization)?.billingAggregationId,
            limit,
            offset
        });
    } catch (e) {
        // ignore error
    }

    let billingInvoice = null;
    try {
        billingInvoice = await sdk.forConsole.organizations.getInvoice({
            organizationId: organization.$id,
            invoiceId: (organization as Models.Organization)?.billingInvoiceId
        });
    } catch (e) {
        // ignore error
    }

    const areCreditsSupported = isCloud ? currentPlan?.supportsCredits : false;

    const [paymentMethods, addressList, billingAddress, availableCredit, billingPlanDowngrade] =
        await Promise.all([
            sdk.forConsole.account.listPaymentMethods(),
            sdk.forConsole.account.listBillingAddresses(),
            billingAddressPromise,
            areCreditsSupported
                ? sdk.forConsole.organizations.getAvailableCredits({
                      organizationId: organization.$id
                  })
                : null,
            organization.billingPlanDowngrade
                ? sdk.forConsole.console.getPlan({
                      planId: organization.billingPlanDowngrade
                  })
                : null
        ]);

    // make number
    const credits = availableCredit ? availableCredit.available : null;
    const { backup, primary } = getOrganizationPaymentMethods(organization, paymentMethods);

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
        limit: getLimit(url, route, DEFAULT_BILLING_PROJECTS_LIMIT),
        offset: pageToOffset(
            getPage(url) || 1,
            getLimit(url, route, DEFAULT_BILLING_PROJECTS_LIMIT)
        ),

        backupPaymentMethod: backup,
        primaryPaymentMethod: primary
    };
};

function getOrganizationPaymentMethods(
    organization: Models.Organization,
    paymentMethods: Models.PaymentMethodList
): {
    backup: Models.PaymentMethod | null;
    primary: Models.PaymentMethod | null;
} {
    let backup: Models.PaymentMethod | null = null;
    let primary: Models.PaymentMethod | null = null;

    for (const paymentMethod of paymentMethods.paymentMethods) {
        if (paymentMethod.$id === organization.paymentMethodId) {
            primary = paymentMethod;
        } else if (paymentMethod.$id === organization.backupPaymentMethodId) {
            backup = paymentMethod;
        }

        if (primary && backup) break;
    }

    return { primary, backup };
}
