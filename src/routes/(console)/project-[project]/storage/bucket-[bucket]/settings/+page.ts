import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
    const { organization } = await parent();
    const currentPlan = await sdk.forConsole.organizations.getPlan(organization.$id);
    return {
        currentPlan
    };
};
