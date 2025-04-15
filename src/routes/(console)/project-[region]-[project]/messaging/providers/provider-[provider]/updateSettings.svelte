<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import type { ProviderInput } from '../store';
    import { Providers, getProviderDisplayNameAndIcon } from '../../provider.svelte';
    import { Dependencies } from '$lib/constants';
    import { MessagingProviderType, type Models } from '@appwrite.io/console';
    import SettingsFormList from '../settingsFormList.svelte';
    import { CardGrid, Heading } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import CreateMember from '$routes/(console)/organization-[organization]/createMember.svelte';

    export let inputs: (ProviderInput | ProviderInput[])[];
    export let providerType: MessagingProviderType;
    export let provider: Providers;
    export let providerId: string;
    export let params: object;

    let flattened: ProviderInput[] = [];
    let formValues: object = {};
    let originalfiles: Record<string, FileList> = {};
    let files: Record<string, FileList> = {};
    let updated = false;
    let newMemberModal = false;
    let message = '';
    let ready = false;

    const { displayName } = getProviderDisplayNameAndIcon(provider);

    switch (providerType) {
        case MessagingProviderType.Push:
            message = 'notifications';
            break;
        case MessagingProviderType.Sms:
            message = 'SMS';
            break;
        case MessagingProviderType.Email:
            message = 'emails';
            break;
    }

    onMount(() => {
        flattened = [];
        for (const i of inputs) {
            if (Array.isArray(i)) {
                flattened.push(...i);
            } else {
                flattened.push(i);
            }
        }
        for (const input of flattened) {
            const value = params[input.name];
            formValues[input.name] = value;
            if (input.type === 'file' && typeof value == 'string' && value.length > 0) {
                const dataTransfer = new DataTransfer();
                const f = new File([value], `${input.name}.${input.allowedFileExtensions}`);
                dataTransfer.items.add(f);
                files[input.name] = dataTransfer.files;
                originalfiles[input.name] = dataTransfer.files;
            }
        }
        ready = true;
    });

    async function update() {
        try {
            const promises = [];
            for (const [key, value] of Object.entries(files)) {
                const promise = value[0].text().then((text) => {
                    formValues[key] = text;
                });
                promises.push(promise);
            }
            await Promise.all(promises);
            let response: Models.Provider;
            switch (provider) {
                case Providers.Twilio:
                    response = await sdk
                        .forProject($page.params.region, $page.params.project)
                        .messaging.updateTwilioProvider(
                            providerId,
                            undefined,
                            undefined,
                            formValues['accountSid'],
                            formValues['authToken'],
                            formValues['from']
                        );
                    break;
                case Providers.Msg91:
                    response = await sdk
                        .forProject($page.params.region, $page.params.project)
                        .messaging.updateMsg91Provider(
                            providerId,
                            undefined,
                            undefined,
                            formValues['templateId'],
                            formValues['senderId'],
                            formValues['authKey']
                        );
                    break;
                case Providers.Telesign:
                    response = await sdk
                        .forProject($page.params.region, $page.params.project)
                        .messaging.updateTelesignProvider(
                            providerId,
                            undefined,
                            undefined,
                            formValues['customerId'],
                            formValues['apiKey'],
                            formValues['from']
                        );
                    break;
                case Providers.Textmagic:
                    response = await sdk
                        .forProject($page.params.region, $page.params.project)
                        .messaging.updateTextmagicProvider(
                            providerId,
                            undefined,
                            undefined,
                            formValues['username'],
                            formValues['apiKey'],
                            formValues['from']
                        );
                    break;
                case Providers.Vonage:
                    response = await sdk
                        .forProject($page.params.region, $page.params.project)
                        .messaging.updateVonageProvider(
                            providerId,
                            undefined,
                            undefined,
                            formValues['apiKey'],
                            formValues['apiSecret'],
                            formValues['from']
                        );
                    break;
                case Providers.Mailgun:
                    response = await sdk
                        .forProject($page.params.region, $page.params.project)
                        .messaging.updateMailgunProvider(
                            providerId,
                            undefined,
                            formValues['apiKey'],
                            formValues['domain'],
                            formValues['isEuRegion'],
                            undefined,
                            formValues['fromName'] || undefined,
                            formValues['fromEmail'],
                            formValues['replyToName'] || undefined,
                            formValues['replyToEmail'] || undefined
                        );
                    break;
                case Providers.Sendgrid:
                    response = await sdk
                        .forProject($page.params.region, $page.params.project)
                        .messaging.updateSendgridProvider(
                            providerId,
                            undefined,
                            undefined,
                            formValues['apiKey'],
                            formValues['fromName'] || undefined,
                            formValues['fromEmail'],
                            formValues['replyToName'] || undefined,
                            formValues['replyToEmail'] || undefined
                        );
                    break;
                case Providers.SMTP:
                    response = await sdk
                        .forProject($page.params.region, $page.params.project)
                        .messaging.updateSmtpProvider(
                            providerId,
                            undefined,
                            formValues['host'],
                            formValues['port'] || undefined,
                            formValues['username'] || undefined,
                            formValues['password'] || undefined,
                            formValues['encryption'],
                            formValues['autoTLS'],
                            undefined,
                            formValues['fromName'] || undefined,
                            formValues['fromEmail'],
                            formValues['replyToName'] || undefined,
                            formValues['replyToEmail'] || undefined
                        );
                    break;
                case Providers.FCM:
                    response = await sdk
                        .forProject($page.params.region, $page.params.project)
                        .messaging.updateFcmProvider(
                            providerId,
                            undefined,
                            undefined,
                            JSON.parse(formValues['serviceAccountJSON'])
                        );
                    break;
                case Providers.APNS:
                    response = await sdk
                        .forProject($page.params.region, $page.params.project)
                        .messaging.updateApnsProvider(
                            providerId,
                            undefined,
                            undefined,
                            formValues['authKey'],
                            formValues['authKeyId'],
                            formValues['teamId'],
                            formValues['bundleId'],
                            formValues['sandbox']
                        );
                    break;
            }
            originalfiles = files;
            await invalidate(Dependencies.MESSAGING_PROVIDER);
            addNotification({
                type: 'success',
                message: `${response.name} has been updated`
            });
            trackEvent(Submit.MessagingProviderUpdate, {
                provider: provider
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.MessagingProviderUpdate);
        }
    }

    $: updated =
        flattened
            .filter((input) => input.type !== 'file')
            .some((input) => formValues[input.name] !== params[input.name]) ||
        Object.keys(files).some((key) => files[key] !== originalfiles[key]);
</script>

<Form onSubmit={update}>
    <CardGrid>
        <div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16" data-private>
            <Heading tag="h6" size="7">Settings</Heading>
        </div>
        <p>
            Configure the settings to <Button
                link
                href={`https://appwrite.io/docs/products/messaging/${provider}`}
                external>enable {displayName}</Button> to send {message}, or <Button
                link
                on:click={() => (newMemberModal = true)}>invite a team member</Button> to complete the
            provider settings.
        </p>
        <svelte:fragment slot="aside">
            <!-- Must wait until ready or else the files input won't be set properly -->
            {#if ready}
                <SettingsFormList bind:files {inputs} bind:params={formValues} />
            {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <div class="u-flex u-flex-wrap u-gap-12">
                <Button disabled={!updated} submit>Update</Button>
            </div>
        </svelte:fragment>
    </CardGrid>
</Form>

<CreateMember bind:showCreate={newMemberModal} />
