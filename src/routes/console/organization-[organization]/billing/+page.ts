import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, depends }) => {
    await parent();
    depends(Dependencies.PAYMENT_METHODS);
    depends(Dependencies.ORGANIZATION);
    depends(Dependencies.CREDIT);
    depends(Dependencies.INVOICES);

    return {
        paymentMethods: await sdk.forConsole.billing.listPaymentMethods(),
        addressList: await sdk.forConsole.billing.listAddresses(),
        aggregationList: await sdk.forConsole.billing.listUsage(params.organization)
    };
};
