<script lang="ts">
    import { CardGrid } from '$lib/components';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { onMount } from 'svelte';
    import { provider } from './store';
    import { Providers } from '../../provider.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { trackEvent, Submit, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { page } from '$app/state';

    let providerName: string = null;
    onMount(async () => {
        providerName ??= $provider.name;
    });

    async function updateName() {
        try {
            let response = { $id: '', name: '' };
            const providerId = $provider.$id;
            switch ($provider.provider) {
                case Providers.Twilio:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.updateTwilioProvider(providerId, providerName);
                    break;
                case Providers.Msg91:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.updateMsg91Provider(providerId, providerName);
                    break;
                case Providers.Telesign:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.updateTelesignProvider(providerId, providerName);
                    break;
                case Providers.Textmagic:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.updateTextmagicProvider(providerId, providerName);
                    break;
                case Providers.Vonage:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.updateVonageProvider(providerId, providerName);
                    break;
                case Providers.Mailgun:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.updateMailgunProvider(providerId, providerName);
                    break;
                case Providers.Sendgrid:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.updateSendgridProvider(providerId, providerName);
                    break;
                case Providers.SMTP:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.updateSmtpProvider(providerId, providerName);
                    break;
                case Providers.FCM:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.updateFcmProvider(providerId, providerName);
                    break;
                case Providers.APNS:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.updateApnsProvider(providerId, providerName);
                    break;
            }
            await invalidate(Dependencies.MESSAGING_PROVIDER);
            addNotification({
                type: 'success',
                message: `${response.name} has been updated`
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

<Form onSubmit={updateName}>
    <CardGrid>
        <svelte:fragment slot="title">Name</svelte:fragment>
        <svelte:fragment slot="aside">
            <ul data-private>
                <InputText
                    id="name"
                    label="Name"
                    placeholder="Enter name"
                    autocomplete={false}
                    bind:value={providerName} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={providerName === $provider.name} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
