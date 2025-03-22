<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, InputSwitch } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import Provider, { Providers } from '../../provider.svelte';
    import ProviderType from '../../providerType.svelte';
    import { provider as providerData } from './store';
    import { page } from '$app/stores';

    let enabled: boolean = null;

    onMount(() => {
        enabled ??= $providerData.enabled;
    });

    async function updateStatus() {
        try {
            let response = { $id: '', name: '' };
            const providerId = $providerData.$id;
            switch ($providerData.provider) {
                case Providers.Twilio:
                    response = await sdk
                        .forProject($page.params.region, $page.params.project)
                        .messaging.updateTwilioProvider(providerId, undefined, enabled);
                    break;
                case Providers.Msg91:
                    response = await sdk
                        .forProject($page.params.region, $page.params.project)
                        .messaging.updateMsg91Provider(providerId, undefined, enabled);
                    break;
                case Providers.Telesign:
                    response = await sdk
                        .forProject($page.params.region, $page.params.project)
                        .messaging.updateTelesignProvider(providerId, undefined, enabled);
                    break;
                case Providers.Textmagic:
                    response = await sdk
                        .forProject($page.params.region, $page.params.project)
                        .messaging.updateTextmagicProvider(providerId, undefined, enabled);
                    break;
                case Providers.Vonage:
                    response = await sdk
                        .forProject($page.params.region, $page.params.project)
                        .messaging.updateVonageProvider(providerId, undefined, enabled);
                    break;
                case Providers.Mailgun:
                    response = await sdk
                        .forProject($page.params.region, $page.params.project)
                        .messaging.updateMailgunProvider(
                            providerId,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            enabled
                        );
                    break;
                case Providers.Sendgrid:
                    response = await sdk
                        .forProject($page.params.region, $page.params.project)
                        .messaging.updateSendgridProvider(providerId, undefined, enabled);
                    break;
                case Providers.SMTP:
                    response = await sdk
                        .forProject($page.params.region, $page.params.project)
                        .messaging.updateSmtpProvider(
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
                            undefined,
                            enabled
                        );
                    break;
                case Providers.FCM:
                    response = await sdk
                        .forProject($page.params.region, $page.params.project)
                        .messaging.updateFcmProvider(providerId, undefined, enabled);
                    break;
                case Providers.APNS:
                    response = await sdk
                        .forProject($page.params.region, $page.params.project)
                        .messaging.updateApnsProvider(providerId, undefined, enabled);
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
            <div data-private class="u-flex-vertical u-gap-16">
                <ul>
                    <InputSwitch
                        id="enabled"
                        label={enabled ? 'Enabled' : 'Disabled'}
                        bind:value={enabled} />
                </ul>
                <div>
                    <p class="title">
                        Provider: <Provider noIcon provider={$providerData.provider} />
                    </p>
                    <p class="title">Type: <ProviderType noIcon type={$providerData.type} /></p>
                    <p>Created: {toLocaleDateTime($providerData.$createdAt)}</p>
                </div>
            </div>
        </div>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <div class="u-flex u-flex-wrap u-gap-12">
            <Button disabled={$providerData.enabled === enabled} on:click={() => updateStatus()}
                >Update</Button>
        </div>
    </svelte:fragment>
</CardGrid>
