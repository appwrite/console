import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    const usage = await sdk.forConsole.billing.listUsage(params.organization);
    console.log(usage);
    return {
        usage
    };
};
