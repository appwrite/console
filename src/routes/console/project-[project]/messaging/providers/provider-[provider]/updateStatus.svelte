<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, InputSwitch } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { wizard } from '$lib/stores/wizard';
    import { onMount } from 'svelte';
    import { MessagingProviderType } from '@appwrite.io/console';
    import Provider, { Providers } from '../../provider.svelte';
    import ProviderType from '../../providerType.svelte';
    import Update from '../update.svelte';
    import { providerParams, providerType, provider } from '../store';
    import { provider as providerData } from './store';

    let enabled: boolean = null;

    onMount(() => {
        enabled ??= $providerData.enabled;
    });

    function configure() {
        if (!isValueOfStringEnum(MessagingProviderType, $providerData.type)) {
            throw new Error(`Invalid provider type: ${$providerData.type}`);
        }

        if (!isValueOfStringEnum(Providers, $providerData.provider)) {
            throw new Error(`Invalid provider: ${$providerData.provider}`);
        }
        $providerType = $providerData.type;
        $provider = $providerData.provider;

        switch ($provider) {
            case Providers.Twilio:
                $providerParams[$provider] = {
                    providerId: $providerData.$id,
                    name: $providerData.name,
                    enabled: $providerData.enabled,
                    accountSid: $providerData.credentials['accountSid'],
                    authToken: $providerData.credentials['authToken'],
                    from: $providerData.options['from']
                };
                break;
            case Providers.Msg91:
                $providerParams[$provider] = {
                    providerId: $providerData.$id,
                    name: $providerData.name,
                    enabled: $providerData.enabled,
                    from: $providerData.options['from'],
                    senderId: $providerData.credentials['senderId'],
                    authKey: $providerData.credentials['authKey']
                };
                break;
            case Providers.Telesign:
                $providerParams[$provider] = {
                    providerId: $providerData.$id,
                    name: $providerData.name,
                    enabled: $providerData.enabled,
                    username: $providerData.credentials['username'],
                    password: $providerData.credentials['password'],
                    from: $providerData.options['from']
                };
                break;
            case Providers.Textmagic:
                $providerParams[$provider] = {
                    providerId: $providerData.$id,
                    name: $providerData.name,
                    enabled: $providerData.enabled,
                    username: $providerData.credentials['username'],
                    apiKey: $providerData.credentials['apiKey'],
                    from: $providerData.options['from']
                };
                break;
            case Providers.Vonage:
                $providerParams[$provider] = {
                    providerId: $providerData.$id,
                    name: $providerData.name,
                    enabled: $providerData.enabled,
                    apiKey: $providerData.credentials['apiKey'],
                    apiSecret: $providerData.credentials['apiSecret'],
                    from: $providerData.options['from']
                };
                break;
            case Providers.Mailgun:
                $providerParams[$provider] = {
                    providerId: $providerData.$id,
                    name: $providerData.name,
                    enabled: $providerData.enabled,
                    isEuRegion: false,
                    fromEmail: $providerData.options['fromEmail'],
                    fromName: $providerData.options['fromName'],
                    replyToEmail: $providerData.options['replyToEmail'],
                    replyToName: $providerData.options['replyToName'],
                    apiKey: $providerData.credentials['apiKey'],
                    domain: $providerData.credentials['domain']
                };
                break;
            case Providers.Sendgrid:
                $providerParams[$provider] = {
                    providerId: $providerData.$id,
                    name: $providerData.name,
                    enabled: $providerData.enabled,
                    apiKey: $providerData.credentials['apiKey'],
                    fromEmail: $providerData.options['fromEmail'],
                    fromName: $providerData.options['fromName'],
                    replyToEmail: $providerData.options['replyToEmail'],
                    replyToName: $providerData.options['replyToName']
                };
                break;
            case Providers.SMTP:
                $providerParams[$provider] = {
                    providerId: $providerData.$id,
                    name: $providerData.name,
                    enabled: $providerData.enabled,
                    host: $providerData.credentials['host'],
                    port: $providerData.credentials['port'],
                    username: $providerData.credentials['username'],
                    password: $providerData.credentials['password'],
                    fromName: $providerData.options['fromName'],
                    fromEmail: $providerData.options['fromEmail'],
                    replyToName: $providerData.options['replyToName'],
                    replyToEmail: $providerData.options['replyToEmail'],
                    encryption: $providerData.options['encryption'],
                    autoTLS: $providerData.options['autoTLS'],
                    mailer: $providerData.options['mailer']
                };
                break;
            case Providers.FCM:
                $providerParams[$provider] = {
                    providerId: $providerData.$id,
                    name: $providerData.name,
                    enabled: $providerData.enabled
                };
                if ('serviceAccountJSON' in $providerData.credentials) {
                    const serviceAccountJSON = $providerData.credentials['serviceAccountJSON'];
                    if (typeof serviceAccountJSON === 'string') {
                        $providerParams[$provider].serviceAccountJSON = serviceAccountJSON;
                    } else if (serviceAccountJSON instanceof Object) {
                        $providerParams[$provider].serviceAccountJSON =
                            JSON.stringify(serviceAccountJSON);
                    }
                }
                break;
            case Providers.APNS:
                $providerParams[$provider] = {
                    providerId: $providerData.$id,
                    name: $providerData.name,
                    enabled: $providerData.enabled,
                    authKey: $providerData.credentials['authKey'],
                    authKeyId: $providerData.credentials['authKeyId'],
                    teamId: $providerData.credentials['teamId'],
                    bundleId: $providerData.credentials['bundleId']
                };
                break;
        }

        wizard.start(Update);
    }

    async function updateStatus() {
        try {
            let response = { $id: '', name: '' };
            const providerId = $providerData.$id;
            switch ($providerData.provider) {
                case Providers.Twilio:
                    response = await sdk.forProject.messaging.updateTwilioProvider(
                        providerId,
                        undefined,
                        enabled
                    );
                    break;
                case Providers.Msg91:
                    response = await sdk.forProject.messaging.updateMsg91Provider(
                        providerId,
                        undefined,
                        enabled
                    );
                    break;
                case Providers.Telesign:
                    response = await sdk.forProject.messaging.updateTelesignProvider(
                        providerId,
                        undefined,
                        enabled
                    );
                    break;
                case Providers.Textmagic:
                    response = await sdk.forProject.messaging.updateTextmagicProvider(
                        providerId,
                        undefined,
                        enabled
                    );
                    break;
                case Providers.Vonage:
                    response = await sdk.forProject.messaging.updateVonageProvider(
                        providerId,
                        undefined,
                        enabled
                    );
                    break;
                case Providers.Mailgun:
                    response = await sdk.forProject.messaging.updateMailgunProvider(
                        providerId,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        enabled
                    );
                    break;
                case Providers.Sendgrid:
                    response = await sdk.forProject.messaging.updateSendgridProvider(
                        providerId,
                        undefined,
                        enabled
                    );
                    break;
                case Providers.SMTP:
                    response = await sdk.forProject.messaging.updateSMTPProvider(
                        providerId,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        enabled
                    );
                    break;
                case Providers.FCM:
                    response = await sdk.forProject.messaging.updateFCMProvider(
                        providerId,
                        undefined,
                        enabled
                    );
                    break;
                case Providers.APNS:
                    response = await sdk.forProject.messaging.updateAPNSProvider(
                        providerId,
                        undefined,
                        enabled
                    );
                    break;
            }
            await invalidate(Dependencies.MESSAGING_PROVIDER);
            addNotification({
                type: 'success',
                message: `${response.name} has been ${enabled ? 'enabled' : 'disabled'}`
            });
            trackEvent(Submit.MessagingProviderUpdate, {
                provider: $providerData
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.MessagingProviderUpdate);
        }
    }
</script>

<CardGrid>
    <div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16" data-private>
        <Provider provider={$providerData.provider} size="l">
            <Heading tag="h6" size="7">{$providerData.name}</Heading>
        </Provider>
    </div>
    <svelte:fragment slot="aside">
        <div class="u-flex u-main-space-between">
            <div data-private>
                <ul>
                    <InputSwitch
                        id="enabled"
                        label={enabled ? 'Enabled' : 'Disabled'}
                        bind:value={enabled} />
                </ul>
                <p class="title">Provider: <Provider noIcon provider={$providerData.provider} /></p>
                <p class="title">Channel: <ProviderType noIcon type={$providerData.type} /></p>
                <p>Created: {toLocaleDateTime($providerData.$createdAt)}</p>
            </div>
        </div>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <div class="u-flex u-flex-wrap u-gap-12">
            <Button secondary on:click={() => configure()}>Configure</Button>
            <Button disabled={$providerData.enabled === enabled} on:click={() => updateStatus()}
                >Update</Button>
        </div>
    </svelte:fragment>
</CardGrid>
