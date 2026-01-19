import type { PageLoad } from './$types';
import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import { isBillingEnabled } from '$lib/profiles/index.svelte';

export const load: PageLoad = async ({ depends, params, parent }) => {
    const { countryList, locale } = await parent();
    depends(Dependencies.ORGANIZATION);

    const [projects, invoices] = await Promise.all([
        sdk.forConsole.projects.list({ queries: [Query.equal('teamId', params.organization)] }),
        isBillingEnabled ? sdk.forConsole.billing.listInvoices(params.organization) : undefined
    ]);

    return {
        projects,
        invoices,
        countryList,
        locale
    };
};
