import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';
import type { Models } from '@appwrite.io/console';

export const load: PageLoad = async () => {
    const codes: Models.LocaleCodeList = await sdk.forProject.locale.listCodes();
    return {
        localeCodes: codes.localeCodes
    };
};
