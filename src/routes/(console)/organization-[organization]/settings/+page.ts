import type { PageLoad } from './$types';
import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import { isCloud } from '$lib/system';

export const load: PageLoad = async ({ depends, params }) => {
    depends(Dependencies.ORGANIZATION);

    const [projects, invoices, countryList, locale] = await Promise.all([
        sdk.forConsole.projects.list([Query.equal('teamId', params.organization)]),
        isCloud ? sdk.forConsole.billing.listInvoices(params.organization) : undefined,
        sdk.forConsole.locale.listCountries(),
        sdk.forConsole.locale.get()
    ]);

    return {
        projects,
        invoices,
        countryList,
        locale
    };
};
