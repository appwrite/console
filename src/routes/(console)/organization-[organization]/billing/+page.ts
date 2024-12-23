import { Dependencies } from '$lib/constants';
import type { Address } from '$lib/sdk/billing';
import type { Organization } from '$lib/stores/organization';
import { sdk } from '$lib/stores/sdk';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, depends }) => {
    const { organization, scopes } = await parent();

    if (!scopes.includes('billing.read')) {
        return redirect(301, `/console/organization-${organization.$id}`);
    }
    depends(Dependencies.PAYMENT_METHODS);
    depends(Dependencies.ORGANIZATION);
    depends(Dependencies.CREDIT);
    depends(Dependencies.INVOICES);
    depends(Dependencies.ADDRESS);

    const billingAddressId = (organization as Organization)?.billingAddressId;
    const billingAddressPromise: Promise<Address> = billingAddressId
        ? sdk.forConsole.billing
            .getOrganizationBillingAddress(organization.$id, billingAddressId)
            .catch(() => null)
        : null;

    const billingAggregationId = (organization as Organization)?.billingAggregationId;

    let billingAggregation = null;
    try {
        billingAggregation = await sdk.forConsole.billing.getAggregation(organization.$id, billingAggregationId);
    } catch (e) {
        // ignore error
    }
    
    const billingInvoiceId = (organization as Organization)?.billingInvoiceId;
    let billingInvoice = null;
    try {
        billingInvoice = await sdk.forConsole.billing.getInvoice(organization.$id, billingInvoiceId)
    } catch (e) {
        // ignore error
    }


    const [
        paymentMethods,
        addressList,
        billingAddress,
        creditList,
        aggregationBillingPlan,
    ] = await Promise.all([
        sdk.forConsole.billing.listPaymentMethods(),
        sdk.forConsole.billing.listAddresses(),
        billingAddressPromise,
        sdk.forConsole.billing.listCredits(organization.$id),
        sdk.forConsole.billing.getPlan(billingAggregation.plan),
    ]);

    return {
        paymentMethods,
        addressList,
        billingAddress,
        aggregationBillingPlan,
        creditList,
        billingAggregation,
        billingInvoice
    };
};
