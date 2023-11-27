import type { PageLoad } from './$types';
import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';

export const load: PageLoad = async ({ depends, parent }) => {
    const { organization } = await parent();
    depends(Dependencies.ORGANIZATION);
    return {
        projects: await sdk.forConsole.projects.list(),
        invoices: await sdk.forConsole.billing.listInvoices(organization.$id)
    };
};
