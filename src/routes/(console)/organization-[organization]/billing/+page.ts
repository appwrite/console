import { Dependencies } from '$lib/constants';
import type { Address } from '$lib/sdk/billing';
import type { Organization } from '$lib/stores/organization';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, depends }) => {
    const { organization } = await parent();
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

    const [paymentMethods, addressList, aggregationList, billingAddress] = await Promise.all([
        sdk.forConsole.billing.listPaymentMethods(),
        sdk.forConsole.billing.listAddresses(),
        sdk.forConsole.billing.listAggregation(organization.$id),
        billingAddressPromise
    ]);

    return {
        paymentMethods,
        addressList,
        aggregationList,
        billingAddress
    };
};
