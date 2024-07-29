import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk.js';
import { Query } from '@appwrite.io/console';

export const load = async ({ depends, parent }) => {
    const { members, organization } = await parent();

    depends(Dependencies.ORGANIZATION);
    return {
        members,
        aggregationList: await sdk.forConsole.billing.listAggregation(organization?.$id, [
            Query.orderDesc('$createdAt')
        ])
    };
};
