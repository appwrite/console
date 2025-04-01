import { Dependencies } from '$lib/constants';
import type { Address } from '$lib/sdk/billing';
import type { Organization } from '$lib/stores/organization';
import { sdk } from '$lib/stores/sdk';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { Query } from '@appwrite.io/console';
import { base } from '$app/paths';

export const load: PageLoad = async ({ parent, depends }) => {
    const { organization, scopes } = await parent();

    if (!scopes.includes('billing.read')) {
        return redirect(301, `${base}/organization-${organization.$id}`);
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

    const [paymentMethods, addressList, aggregationList, billingAddress, creditList, invoices] =
        await Promise.all([
            sdk.forConsole.billing.listPaymentMethods(),
            sdk.forConsole.billing.listAddresses(),
            sdk.forConsole.billing.listAggregation(organization.$id),
            billingAddressPromise,
            sdk.forConsole.billing.listCredits(organization.$id),
            sdk.forConsole.billing.listInvoices(organization.$id, [
                Query.limit(1),
                Query.equal('from', organization.billingCurrentInvoiceDate)
            ])
        ]);

    return {
        paymentMethods,
        addressList,
        aggregationList,
        billingAddress,
        creditList,
        invoices
    };
};
