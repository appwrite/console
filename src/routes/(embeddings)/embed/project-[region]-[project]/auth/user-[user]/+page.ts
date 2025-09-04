import type { PageLoad } from './$types';
import { sdk } from '$lib/stores/sdk';

export const load: PageLoad = async ({ params }) => {
    const [user, userFactors] = await Promise.all([
        sdk.forProject(params.region, params.project).users.get(params.user),
        sdk.forProject(params.region, params.project).users.listMfaFactors(params.user)
    ]);

    return { user, userFactors };
};
