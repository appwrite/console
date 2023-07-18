import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, depends }) => {
    await parent();
    depends(Dependencies.PAYMENT_METHODS);
    depends(Dependencies.ORGANIZATION);

    return {
        paymentMethods: await sdk.forConsole.billing.listPaymentMethods(),
        creditList: await sdk.forConsole.billing.listCredits(params.organization)
    };
};
