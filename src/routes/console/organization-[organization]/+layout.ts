import Header from './header.svelte';
import Breadcrumbs from './breadcrumbs.svelte';
import { sdkForConsole } from '$lib/stores/sdk';
import type { LayoutLoad } from './$types';
import { error } from '@sveltejs/kit';
import { Dependencies } from '$lib/constants';

export const load: LayoutLoad = async ({ params, parent, depends }) => {
    await parent();
    depends(Dependencies.ORGANIZATION);
    depends(Dependencies.PAYMENT_METHODS);

    try {
        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            organization: await sdkForConsole.teams.get(params.organization),
            paymentMethods: await sdkForConsole.billing.listPaymentMethods(params.organization),
            members: await sdkForConsole.teams.listMemberships(params.organization)
        };
    } catch (e) {
        localStorage.removeItem('organization');
        throw error(e.code, e.message);
    }
};
