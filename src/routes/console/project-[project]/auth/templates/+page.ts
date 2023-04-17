import { sdk } from '$lib/stores/sdk';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
    let codes = { localeCodes: [] };
    try {
        codes = await sdk.forProject.client.call(
            'GET',
            new URL(sdk.forProject.client.config.endpoint + '/locale/codes')
        );
    } catch (e) {
        console.log(e);
    }
    return {
        localeCodes: codes.localeCodes
    };
};
