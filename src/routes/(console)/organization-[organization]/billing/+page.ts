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
        ? sdk.forConsole.organizations
              .getBillingAddress(organization.$id, billingAddressId)
              .catch(() => null)
        : null;

    const [paymentMethods, addressList, aggregationList, billingAddress] = await Promise.all([
        sdk.forConsole.account.listPaymentMethods(),
        sdk.forConsole.account.listBillingAddresses(),
        sdk.forConsole.organizations.listAggregations(organization.$id),
        billingAddressPromise
    ]);

    return {
        paymentMethods,
        addressList,
        aggregationList,
        billingAddress
    };
};
