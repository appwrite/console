import { Dependencies } from '$lib/constants';
import type { Address } from '$lib/sdk/billing';
import type { Organization } from '$lib/stores/organization';
import { sdk } from '$lib/stores/sdk';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { Query } from '@appwrite.io/console';

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
    const billingInvoiceId = (organization as Organization)?.billingInvoiceId;

    const billingAggregation = await sdk.forConsole.billing.getAggregation(organization.$id, billingAggregationId);

    const [
        paymentMethods,
        addressList,
        aggregationList,
        billingAddress,
        creditList,
        aggregationBillingPlan,
        billingInvoice,
    ] = await Promise.all([
        sdk.forConsole.billing.listPaymentMethods(),
        sdk.forConsole.billing.listAddresses(),
        sdk.forConsole.billing.listAggregation(organization.$id),
        billingAddressPromise,
        sdk.forConsole.billing.listCredits(organization.$id),
        sdk.forConsole.billing.getPlan(billingAggregation.plan),
        sdk.forConsole.billing.getInvoice(organization.$id, billingInvoiceId)
    ]);

    return {
        paymentMethods,
        addressList,
        aggregationList,
        billingAddress,
        aggregationBillingPlan,
        creditList,
        billingAggregation,
        billingInvoice
    };
};
