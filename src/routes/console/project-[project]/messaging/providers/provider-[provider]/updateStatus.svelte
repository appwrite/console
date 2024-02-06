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
    import { providerParams, providerType, provider as wizardProvider } from '../wizard/store';
    import { provider } from './store';

    let enabled: boolean = null;

    onMount(() => {
        enabled ??= $provider.enabled;
    });

    function configure() {
        if (!isValueOfStringEnum(MessagingProviderType, $provider.type)) {
            throw new Error(`Invalid provider type: ${$provider.type}`);
        }

        if (!isValueOfStringEnum(Providers, $provider.provider)) {
            throw new Error(`Invalid provider: ${$provider.provider}`);
        }
        $providerType = $provider.type;
        $wizardProvider = $provider.provider;

        switch ($wizardProvider) {
            case Providers.Twilio:
                $providerParams[$wizardProvider] = {
                    providerId: $provider.$id,
                    name: $provider.name,
                    enabled: $provider.enabled,
                    accountSid: $provider.credentials['accountSid'],
                    authToken: $provider.credentials['authToken'],
                    from: $provider.options['from']
                };
                break;
            case Providers.Msg91:
                $providerParams[$wizardProvider] = {
                    providerId: $provider.$id,
                    name: $provider.name,
                    enabled: $provider.enabled,
                    from: $provider.options['from'],
                    senderId: $provider.credentials['senderId'],
                    authKey: $provider.credentials['authKey']
                };
                break;
            case Providers.Telesign:
                $providerParams[$wizardProvider] = {
                    providerId: $provider.$id,
                    name: $provider.name,
                    enabled: $provider.enabled,
                    username: $provider.credentials['username'],
                    password: $provider.credentials['password'],
                    from: $provider.options['from']
                };
                break;
            case Providers.Textmagic:
                $providerParams[$wizardProvider] = {
                    providerId: $provider.$id,
                    name: $provider.name,
                    enabled: $provider.enabled,
                    username: $provider.credentials['username'],
                    apiKey: $provider.credentials['apiKey'],
                    from: $provider.options['from']
                };
                break;
            case Providers.Vonage:
                $providerParams[$wizardProvider] = {
                    providerId: $provider.$id,
                    name: $provider.name,
                    enabled: $provider.enabled,
                    apiKey: $provider.credentials['apiKey'],
                    apiSecret: $provider.credentials['apiSecret'],
                    from: $provider.options['from']
                };
                break;
            case Providers.Mailgun:
                $providerParams[$wizardProvider] = {
                    providerId: $provider.$id,
                    name: $provider.name,
                    enabled: $provider.enabled,
                    isEuRegion: false,
                    fromEmail: $provider.options['from'],
                    apiKey: $provider.credentials['apiKey'],
                    domain: $provider.credentials['domain']
                };
                break;
            case Providers.Sendgrid:
                $providerParams[$wizardProvider] = {
                    providerId: $provider.$id,
                    name: $provider.name,
                    enabled: $provider.enabled,
                    apiKey: $provider.credentials['apiKey'],
                    fromEmail: $provider.options['from']
                };
                break;
            case Providers.FCM:
                $providerParams[$wizardProvider] = {
                    providerId: $provider.$id,
                    name: $provider.name,
                    enabled: $provider.enabled,
                    serviceAccountJSON: $provider.credentials['serviceAccountJSON']
                };
                break;
            case Providers.APNS:
                $providerParams[$wizardProvider] = {
                    providerId: $provider.$id,
                    name: $provider.name,
                    enabled: $provider.enabled,
                    authKey: $provider.credentials['authKey'],
                    authKeyId: $provider.credentials['authKeyId'],
                    teamId: $provider.credentials['teamId'],
                    bundleId: $provider.credentials['bundleId']
                };
                break;
        }

        wizard.start(Update);
    }

    async function updateStatus() {
        try {
            let response = { $id: '', name: '' };
            const providerId = $provider.$id;
            switch ($provider.provider) {
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
                provider: $provider
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
        <Provider provider={$provider.provider} size="l">
            <Heading tag="h6" size="7">{$provider.name}</Heading>
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
                <p class="title">Provider: <Provider noIcon provider={$provider.provider} /></p>
                <p class="title">Channel: <ProviderType noIcon type={$provider.type} /></p>
                <p>Created: {toLocaleDateTime($provider.$createdAt)}</p>
            </div>
        </div>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <div class="u-flex u-flex-wrap u-gap-12">
            <Button secondary on:click={() => configure()}>Configure</Button>
            <Button disabled={$provider.enabled === enabled} on:click={() => updateStatus()}
                >Update</Button>
        </div>
    </svelte:fragment>
</CardGrid>
