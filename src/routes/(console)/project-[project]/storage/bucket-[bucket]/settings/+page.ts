import type { PageLoad } from './$types';
import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';

export const load: PageLoad = async ({ parent }) => {
    const { organization } = await parent();
    const currentPlan = isCloud
        ? await sdk.forConsole.billing.getOrganizationPlan(organization.$id)
        : null;
    return {
        currentPlan
    };
};
