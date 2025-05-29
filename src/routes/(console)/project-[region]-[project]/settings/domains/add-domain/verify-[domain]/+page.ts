import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import { Dependencies } from '$lib/constants.js';
import type { Models } from '@appwrite.io/console';

export const load = async ({ depends }) => {
    depends(Dependencies.DOMAINS);

    let domainsList: Models.DomainsList;
    if (isCloud) {
        domainsList = await sdk.forConsole.domains.list();
    }

    return {
        domainsList
    };
};
