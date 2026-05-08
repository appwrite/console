import type { PageLoad } from './$types';
import type { Models } from '@appwrite.io/console';

export const load: PageLoad = async ({ parent }) => {
    const { dedicatedDatabase } = await parent();

    return {
        dedicatedDatabase: dedicatedDatabase as Models.DedicatedDatabase | null
    };
};
