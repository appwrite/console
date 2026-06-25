import { Dependencies } from '$lib/constants';
import { sdk } from '$lib/stores/sdk';
import type { Models } from '@appwrite.io/console';
import type { PageLoad } from './$types';

const OAUTH2_PREFIX = 'oauth2:';

export const load: PageLoad = async ({ depends, parent }) => {
    depends(Dependencies.IDENTITIES);

    // Apps authorized through the console OAuth2 server (e.g. the Appwrite CLI via
    // the device flow) are stored as `oauth2:<appId>` identities by the parent
    // layout load. Resolve each to its app metadata for richer rendering.
    const { identities } = await parent();
    const grants = (identities.identities as Models.Identity[]).filter((identity) =>
        identity.provider?.startsWith(OAUTH2_PREFIX)
    );

    const connectedApps = await Promise.all(
        grants.map(async (identity) => {
            const appId = identity.provider.slice(OAUTH2_PREFIX.length);
            const app = await sdk.forConsole.apps.get({ appId }).catch(() => null);
            return { identity, appId, app };
        })
    );

    return { connectedApps };
};
