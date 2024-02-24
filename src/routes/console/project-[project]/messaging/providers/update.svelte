<script lang="ts">
    import { Wizard } from '$lib/layout';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import Configure from './wizard/configure.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { project } from '../../store';
    import { wizard } from '$lib/stores/wizard';
    import { provider, providerParams } from './wizard/store';
    import { Providers } from '../provider.svelte';
    import { Dependencies } from '$lib/constants';
    import type { Models } from '@appwrite.io/console';

    async function update() {
        try {
            let response: Models.Provider;
            const providerId = $providerParams[$provider].providerId;
            switch ($provider) {
                case Providers.Twilio:
                    response = await sdk.forProject.messaging.updateTwilioProvider(
                        providerId,
                        $providerParams[$provider].name,
                        $providerParams[$provider].enabled,
                        $providerParams[$provider].accountSid,
                        $providerParams[$provider].authToken,
                        $providerParams[$provider].from
                    );
                    break;
                case Providers.Msg91:
                    response = await sdk.forProject.messaging.updateMsg91Provider(
                        providerId,
                        $providerParams[$provider].name,
                        $providerParams[$provider].enabled,
                        $providerParams[$provider].senderId,
                        $providerParams[$provider].authKey,
                        $providerParams[$provider].from
                    );
                    break;
                case Providers.Telesign:
                    response = await sdk.forProject.messaging.updateTelesignProvider(
                        providerId,
                        $providerParams[$provider].name,
                        $providerParams[$provider].enabled,
                        $providerParams[$provider].username,
                        $providerParams[$provider].password,
                        $providerParams[$provider].from
                    );
                    break;
                case Providers.Textmagic:
                    response = await sdk.forProject.messaging.updateTextmagicProvider(
                        providerId,
                        $providerParams[$provider].name,
                        $providerParams[$provider].enabled,
                        $providerParams[$provider].username,
                        $providerParams[$provider].apiKey,
                        $providerParams[$provider].from
                    );
                    break;
                case Providers.Vonage:
                    response = await sdk.forProject.messaging.updateVonageProvider(
                        providerId,
                        $providerParams[$provider].name,
                        $providerParams[$provider].enabled,
                        $providerParams[$provider].apiKey,
                        $providerParams[$provider].apiSecret,
                        $providerParams[$provider].from
                    );
                    break;
                case Providers.Mailgun:
                    response = await sdk.forProject.messaging.updateMailgunProvider(
                        providerId,
                        $providerParams[$provider].name,
                        $providerParams[$provider].apiKey,
                        $providerParams[$provider].domain,
                        $providerParams[$provider].isEuRegion,
                        $providerParams[$provider].enabled,
                        $providerParams[$provider].fromName || undefined,
                        $providerParams[$provider].fromEmail,
                        $providerParams[$provider].replyToName || undefined,
                        $providerParams[$provider].replyToEmail || undefined
                    );
                    break;
                case Providers.Sendgrid:
                    response = await sdk.forProject.messaging.updateSendgridProvider(
                        providerId,
                        $providerParams[$provider].name,
                        $providerParams[$provider].enabled,
                        $providerParams[$provider].apiKey,
                        $providerParams[$provider].fromName || undefined,
                        $providerParams[$provider].fromEmail,
                        $providerParams[$provider].replyToName || undefined,
                        $providerParams[$provider].replyToEmail || undefined
                    );
                    break;
                case Providers.SMTP:
                    response = await sdk.forProject.messaging.updateSmtpProvider(
                        providerId,
                        $providerParams[$provider].name,
                        $providerParams[$provider].host,
                        $providerParams[$provider].port || undefined,
                        $providerParams[$provider].username || undefined,
                        $providerParams[$provider].password || undefined,
                        $providerParams[$provider].encryption,
                        $providerParams[$provider].autoTLS,
                        $providerParams[$provider].mailer || undefined,
                        $providerParams[$provider].fromName || undefined,
                        $providerParams[$provider].fromEmail,
                        $providerParams[$provider].replyToName || undefined,
                        $providerParams[$provider].replyToEmail || undefined,
                        $providerParams[$provider].enabled
                    );
                    break;
                case Providers.FCM:
                    response = await sdk.forProject.messaging.updateFcmProvider(
                        providerId,
                        $providerParams[$provider].name,
                        $providerParams[$provider].enabled,
                        JSON.parse($providerParams[$provider].serviceAccountJSON)
                    );
                    break;
                case Providers.APNS:
                    response = await sdk.forProject.messaging.updateApnsProvider(
                        providerId,
                        $providerParams[$provider].name,
                        $providerParams[$provider].enabled,
                        $providerParams[$provider].authKey,
                        $providerParams[$provider].authKeyId,
                        $providerParams[$provider].teamId,
                        $providerParams[$provider].bundleId,
                        $providerParams[$provider].sandbox
                    );
                    break;
            }
            await invalidate(Dependencies.MESSAGING_PROVIDER);
            wizard.hide();
            addNotification({
                type: 'success',
                message: `${response.name} has been updated`
            });
            trackEvent(Submit.MessagingProviderUpdate, {
                provider: $provider
            });
            await goto(
                `${base}/console/project-${$project.$id}/messaging/providers/provider-${response.$id}`
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.MessagingProviderUpdate);
        }
    }

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Configure',
        component: Configure
    });
</script>

<Wizard title="Update provider" steps={stepsComponents} on:finish={update} finalAction="Update" />
