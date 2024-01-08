import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import { isCloud } from '$lib/system';

export const load: PageLoad = async ({ url, route }) => {
    return {
        compromisedUsersCount: !isCloud ? 0 : (await sdk.forConsole.billing.getHIBP()).total
    };
};
