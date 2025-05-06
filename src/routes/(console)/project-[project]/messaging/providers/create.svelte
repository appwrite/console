<script lang="ts">
    import { Wizard, WizardWithSteps } from '$lib/layout';
    import type { WizardStepsType } from '$lib/layout/wizardWithSteps.svelte';
    import Provider from './wizard/provider.svelte';
    import Settings from './wizard/settings.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { project } from '../../store';
    import { wizard } from '$lib/stores/wizard';
    import { provider, providerParams } from './wizard/store';
    import { ID, type Models } from '@appwrite.io/console';
    import { Providers } from '../provider.svelte';
    import { Button, Form } from '$lib/elements/forms';
    import { Fieldset, Layout } from '@appwrite.io/pink-svelte';

    async function create() {
        try {
            let response: Models.Provider;
            const providerId = $providerParams[$provider].providerId || ID.unique();
            switch ($provider) {
                case Providers.Twilio:
                    response = await sdk.forProject.messaging.createTwilioProvider(
                        providerId,
                        $providerParams[$provider].name,
                        $providerParams[$provider].from,
                        $providerParams[$provider].accountSid,
                        $providerParams[$provider].authToken,
                        $providerParams[$provider].enabled
                    );
                    break;
                case Providers.Msg91:
                    response = await sdk.forProject.messaging.createMsg91Provider(
                        providerId,
                        $providerParams[$provider].name,
                        $providerParams[$provider].templateId,
                        $providerParams[$provider].senderId,
                        $providerParams[$provider].authKey,
                        $providerParams[$provider].enabled
                    );
                    break;
                case Providers.Telesign:
                    response = await sdk.forProject.messaging.createTelesignProvider(
                        providerId,
                        $providerParams[$provider].name,
                        $providerParams[$provider].from,
                        $providerParams[$provider].customerId,
                        $providerParams[$provider].apiKey,
                        $providerParams[$provider].enabled
                    );
                    break;
                case Providers.Textmagic:
                    response = await sdk.forProject.messaging.createTextmagicProvider(
                        providerId,
                        $providerParams[$provider].name,
                        $providerParams[$provider].from,
                        $providerParams[$provider].username,
                        $providerParams[$provider].apiKey,
                        $providerParams[$provider].enabled
                    );
                    break;
                case Providers.Vonage:
                    response = await sdk.forProject.messaging.createVonageProvider(
                        providerId,
                        $providerParams[$provider].name,
                        $providerParams[$provider].from,
                        $providerParams[$provider].apiKey,
                        $providerParams[$provider].apiSecret,
                        $providerParams[$provider].enabled
                    );
                    break;
                case Providers.Mailgun:
                    response = await sdk.forProject.messaging.createMailgunProvider(
                        providerId,
                        $providerParams[$provider].name,
                        $providerParams[$provider].apiKey,
                        $providerParams[$provider].domain,
                        $providerParams[$provider].isEuRegion,
                        $providerParams[$provider].fromName || undefined,
                        $providerParams[$provider].fromEmail,
                        $providerParams[$provider].replyToName || undefined,
                        $providerParams[$provider].replyToEmail || undefined,
                        $providerParams[$provider].enabled
                    );
                    break;
                case Providers.Sendgrid:
                    response = await sdk.forProject.messaging.createSendgridProvider(
                        providerId,
                        $providerParams[$provider].name,
                        $providerParams[$provider].apiKey,
                        $providerParams[$provider].fromName || undefined,
                        $providerParams[$provider].fromEmail,
                        $providerParams[$provider].replyToName || undefined,
                        $providerParams[$provider].replyToEmail || undefined,
                        $providerParams[$provider].enabled
                    );
                    break;
                case Providers.SMTP:
                    response = await sdk.forProject.messaging.createSmtpProvider(
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
                    response = await sdk.forProject.messaging.createFcmProvider(
                        providerId,
                        $providerParams[$provider].name,
                        JSON.parse($providerParams[$provider].serviceAccountJSON),
                        $providerParams[$provider].enabled
                    );
                    break;
                case Providers.APNS:
                    response = await sdk.forProject.messaging.createApnsProvider(
                        providerId,
                        $providerParams[$provider].name,
                        $providerParams[$provider].authKey,
                        $providerParams[$provider].authKeyId,
                        $providerParams[$provider].teamId,
                        $providerParams[$provider].bundleId,
                        $providerParams[$provider].sandbox,
                        $providerParams[$provider].enabled
                    );
                    break;
            }
            wizard.hide();
            addNotification({
                type: 'success',
                message: `${response.name} has been created`
            });
            trackEvent(Submit.MessagingProviderCreate, {
                provider: $provider
            });
            await goto(
                `${base}/project-${$project.$id}/messaging/providers/provider-${response.$id}`
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.MessagingProviderCreate);
        }
    }

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Provider',
        component: Provider
    });
    stepsComponents.set(2, {
        label: 'Settings',
        component: Settings
    });
</script>

<Wizard title="Create provider">
    <Form onSubmit={create} isModal={false}>
        <Layout.Stack gap="xxl">
            {$provider}
            <Fieldset legend="Provider">
                <Provider />
            </Fieldset>
            <Fieldset legend="Settings">
                <Settings />
            </Fieldset>
            <Button submit>Create</Button>
        </Layout.Stack>
    </Form>
</Wizard>
<!--<WizardWithSteps title="Create provider" steps={stepsComponents} on:finish={create} />-->
