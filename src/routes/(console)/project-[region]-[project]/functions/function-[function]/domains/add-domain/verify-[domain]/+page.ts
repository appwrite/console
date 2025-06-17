import { sdk } from '$lib/stores/sdk';
import { isCloud } from '$lib/system';
import { Dependencies } from '$lib/constants.js';
import { type Models, Query } from '@appwrite.io/console';

export const load = async ({ depends, parent }) => {
    const { organization } = await parent();
    depends(Dependencies.DOMAINS);

    let domainsList: Models.DomainsList;
    if (isCloud) {
        domainsList = await sdk.forConsole.domains.list([Query.equal('teamId', organization.$id)]);
    }

    return {
        domainsList
    };
};
