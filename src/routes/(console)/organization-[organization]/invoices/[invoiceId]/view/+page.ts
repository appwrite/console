import { getApiEndpoint, sdk } from '$lib/stores/sdk';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    // verify invoice exists
    const invoice = await sdk.forConsole.billing.getInvoice(params.organization, params.invoiceId);
    const endpoint = getApiEndpoint();

    return redirect(
        302,
        `${endpoint}/organizations/${params.organization}/invoices/${invoice.$id}/view`
    );
};
