import type { Organization } from '$lib/stores/organization';
import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent, url }) => {
    const { period } = params;
    const parentData = await parent();
    const org = parentData.organization as Organization;
    const today = new Date().toISOString();
    let startDate: string;
    let endDate: string;

    if (period === 'current') {
        startDate = org.billingCurrentInvoiceDate;
        endDate = today;
    } else if (period === 'previous') {
        const prevDate = new Date(org.billingCurrentInvoiceDate);
        prevDate.setDate(prevDate.getDate() - 30);
        startDate = prevDate.toISOString();
        endDate = org.billingCurrentInvoiceDate;
    } else if (period === 'custom') {
        startDate = url.searchParams.get('start') ?? org.billingCurrentInvoiceDate;
        endDate = url.searchParams.get('end') ?? today;
    }
    const usage = await sdk.forConsole.billing.listUsage(
        params.organization,
        startDate ?? org.billingCurrentInvoiceDate,
        endDate ?? today
    );
    console.log(usage);
    return {
        organizationUsage: usage
    };
};
