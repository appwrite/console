import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent, depends }) => {
    await parent();
    depends(Dependencies.PAYMENT_METHODS);

    return {
        paymentMethods: await sdk.forConsole.billing.listPaymentMethods()
        // budget: await sdk.forConsole.billing.(params.organization)
    };
};
