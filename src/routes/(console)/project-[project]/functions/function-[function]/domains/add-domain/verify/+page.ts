import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';

export const load = async ({ params }) => {
    if (isCloud) {
        // if (params?.id) {
        //     return {
        //         domain: await sdk.forConsole.domains.get(params.id)
        //     };
        // }
    } else {
        return {
            domain: undefined
        };
    }
};
