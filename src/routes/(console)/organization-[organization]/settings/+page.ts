import type { PageLoad } from './$types';
import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import { isCloud } from '$lib/system';

export const load: PageLoad = async ({ depends, params, parent }) => {
    const { countryList, locale } = await parent();
    depends(Dependencies.ORGANIZATION);

    const [projects, invoices] = await Promise.all([
        sdk.forConsole.projects.list([Query.equal('teamId', params.organization)]),
        isCloud ? sdk.forConsole.billing.listInvoices(params.organization) : undefined
    ]);

    return {
        projects,
        invoices,
        countryList,
        locale
    };
};
