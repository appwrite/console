import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { Dependencies } from '$lib/constants';
import { isCloud } from '$lib/system';

export const load = async ({ depends, parent }) => {
    const { organization } = await parent();
    depends(Dependencies.SITES);
    const sitesLive = !isCloud || organization.$id === 'appwriteOfficials';

    return {
        header: sitesLive ? Header : undefined,
        breadcrumbs: Breadcrumbs,
        sitesLive
    };
};
