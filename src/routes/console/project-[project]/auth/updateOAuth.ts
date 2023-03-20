import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { Dependencies } from '$lib/constants';
import { addNotification } from '$lib/stores/notifications';
import type { Provider } from '$lib/stores/oauth-providers';
import { sdk } from '$lib/stores/sdk';

type Args = {
    projectId: string;
    provider: Provider;
    appId: string;
    secret: string;
    enabled: boolean;
};

type Return = {
    status: 'success' | 'error';
    message?: string;
};

export async function updateOAuth({
    projectId,
    provider,
    appId,
    secret,
    enabled
}: Args): Promise<Return> {
    try {
        await sdk.forConsole.projects.updateOAuth2(
            projectId,
            provider.name.toLowerCase(),
            appId,
            secret,
            enabled
        );
        addNotification({
            type: 'success',
            message: `${provider.name} authentication has been updated`
        });
        trackEvent(Submit.ProviderUpdate, {
            provider,
            enabled
        });
        invalidate(Dependencies.PROJECT);

        return { status: 'success' };
    } catch (e) {
        trackError(e, Submit.ProviderUpdate);
        return { status: 'error', message: e.message };
    }
}
