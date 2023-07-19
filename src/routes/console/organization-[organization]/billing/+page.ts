import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, depends }) => {
    await parent();
    depends(Dependencies.PAYMENT_METHODS);
    depends(Dependencies.ORGANIZATION);
    depends(Dependencies.CREDIT);
    depends(Dependencies.INVOICES);

    return {
        paymentMethods: await sdk.forConsole.billing.listPaymentMethods(),
        creditList: await sdk.forConsole.billing.listCredits(params.organization),
        invoiceList: await sdk.forConsole.billing.listInvoices(params.organization, [
            Query.limit(5)
        ])
    };
};
