import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import { Query } from '@appwrite.io/console';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ depends, params }) => {
    depends(Dependencies.ORGANIZATION);

    const [projects, invoices] = await Promise.all([
        sdk.forConsole.projects.list([Query.equal('teamId', params.organization)]),
        isCloud ? sdk.forConsole.organizations.listInvoices(params.organization) : undefined
    ]);

    return {
        projects,
        invoices
    };
};
