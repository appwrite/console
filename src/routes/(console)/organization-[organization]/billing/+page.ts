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

    let billingAddress: Address = null;
    const billingAddressId = (organization as Organization)?.billingAddressId;
    if (billingAddressId) {
        try {
            billingAddress = await sdk.forConsole.billing.getOrganizationBillingAddress(
                organization.$id,
                billingAddressId
            );
        } catch {
            billingAddress = null;
        }
    }

    return {
        paymentMethods: await sdk.forConsole.billing.listPaymentMethods(),
        addressList: await sdk.forConsole.billing.listAddresses(),
        aggregationList: await sdk.forConsole.billing.listAggregation(organization.$id),
        billingAddress
    };
};
