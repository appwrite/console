import { invalidate } from '$app/navigation';
import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
import { Dependencies } from '$lib/constants';
import { isValueOfStringEnum } from '$lib/helpers/types';
import { addNotification } from '$lib/stores/notifications';
import { sdk } from '$lib/stores/sdk';
import { OAuthProvider, type Models } from '@appwrite.io/console';

type Args = {
    projectId: string;
    provider: Models.AuthProvider;
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
        if (!isValueOfStringEnum(OAuthProvider, provider.key)) {
            throw new Error(`Invalid OAuth2 provider: ${provider.key}`);
        }
        await sdk.forConsole.projects.updateOAuth2(
            projectId,
            provider.key,
            appId || undefined,
            secret || undefined,
            enabled
        );
        await invalidate(Dependencies.PROJECT);

        addNotification({
            type: 'success',
            message: `${provider.name} authentication has been updated`
        });
        trackEvent(Submit.ProviderUpdate, {
            provider,
            enabled
        });

        return { status: 'success' };
    } catch (e) {
        trackError(e, Submit.ProviderUpdate);
        return { status: 'error', message: e.message };
    }
}
