import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import { selectedTab } from '../store';
import type { PageLoad } from './$types';
import { sleep } from '$lib/helpers/promises';

selectedTab.set('keys');

export const load: PageLoad = async ({ params, depends, url }) => {
    depends(Dependencies.KEYS);

    const currentKeyType = url.searchParams.get('mode') || 'standard';

    const isStandardApiKey = currentKeyType === 'standard';

    // TODO: (@itznotabug) Replace this delay with a proper API call
    //  for development keys once the backend is implemented.
    if (!isStandardApiKey) await sleep(1250);

    return {
        // TODO: (@itznotabug) Update this logic to fetch actual development keys from the backend
        //  when the console SDK supports it.
        keys: await sdk.forConsole.projects.listKeys(params.project)
    };
};
