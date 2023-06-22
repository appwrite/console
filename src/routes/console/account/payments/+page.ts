import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, depends }) => {
    await parent();
    depends(Dependencies.PAYMENT_METHODS);

    return {
        // paymentMethods: await sdk.forConsole.billing.listPaymentMethods()
        paymentMethods: [],
        organizations: await sdk.forConsole.teams.list([Query.orderDesc('$createdAt')])
    };
};
