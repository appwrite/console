import type { PageLoad } from './$types';
import { Dependencies } from '$lib/constants';

export const load: PageLoad = async ({ depends, parent }) => {
    depends(Dependencies.DATABASE);

    const { database, dedicatedDatabase } = await parent();

    return {
        database,
        dedicatedDatabase
    };
};
