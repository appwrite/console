import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { preferences } from '$lib/stores/preferences';
import { failedInvoice } from '$lib/stores/billing';
import { isCloud } from '$lib/system';
import type { Organization } from '$lib/stores/organization';
import { defaultRoles, defaultScopes } from '$lib/constants';
import type { Plan } from '$lib/sdk/billing';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.ARTIFACTS);
    sdk.forProject.project.client.setProject(params.project);

    try {
        return {
            artifacts: await sdk.forProject.imagine.list()
        };
    } catch (e) {
        error(e.code, e.message);
    }
};
