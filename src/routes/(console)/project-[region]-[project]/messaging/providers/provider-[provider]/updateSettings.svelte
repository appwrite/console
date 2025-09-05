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
    import { CardGrid } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { onMount } from 'svelte';
    import CreateMember from '$routes/(console)/organization-[organization]/createMember.svelte';
    import { page } from '$app/state';
    import { Link as PinkLink } from '@appwrite.io/pink-svelte';
    import Link from '$lib/elements/link.svelte';

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
                        .forProject(page.params.region, page.params.project)
                        .messaging.updateTwilioProvider({
                            providerId,
                            accountSid: formValues['accountSid'],
                            authToken: formValues['authToken'],
                            from: formValues['from']
                        });
                    break;
                case Providers.Msg91:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.updateMsg91Provider({
                            providerId,
                            templateId: formValues['templateId'],
                            senderId: formValues['senderId'],
                            authKey: formValues['authKey']
                        });
                    break;
                case Providers.Telesign:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.updateTelesignProvider({
                            providerId,
                            customerId: formValues['customerId'],
                            apiKey: formValues['apiKey'],
                            from: formValues['from']
                        });
                    break;
                case Providers.Textmagic:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.updateTextmagicProvider({
                            providerId,
                            username: formValues['username'],
                            apiKey: formValues['apiKey'],
                            from: formValues['from']
                        });
                    break;
                case Providers.Vonage:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.updateVonageProvider({
                            providerId,
                            apiKey: formValues['apiKey'],
                            apiSecret: formValues['apiSecret'],
                            from: formValues['from']
                        });
                    break;
                case Providers.Mailgun:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.updateMailgunProvider({
                            providerId,
                            apiKey: formValues['apiKey'],
                            domain: formValues['domain'],
                            isEuRegion: formValues['isEuRegion'],
                            fromName: formValues['fromName'] || undefined,
                            fromEmail: formValues['fromEmail'],
                            replyToName: formValues['replyToName'] || undefined,
                            replyToEmail: formValues['replyToEmail'] || undefined
                        });
                    break;
                case Providers.Sendgrid:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.updateSendgridProvider({
                            providerId,
                            apiKey: formValues['apiKey'],
                            fromName: formValues['fromName'] || undefined,
                            fromEmail: formValues['fromEmail'],
                            replyToName: formValues['replyToName'] || undefined,
                            replyToEmail: formValues['replyToEmail'] || undefined
                        });
                    break;
                case Providers.SMTP:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.updateSMTPProvider({
                            providerId,
                            host: formValues['host'],
                            port: formValues['port'] || undefined,
                            username: formValues['username'] || undefined,
                            password: formValues['password'] || undefined,
                            encryption: formValues['encryption'],
                            autoTLS: formValues['autoTLS'],
                            fromName: formValues['fromName'] || undefined,
                            fromEmail: formValues['fromEmail'],
                            replyToName: formValues['replyToName'] || undefined,
                            replyToEmail: formValues['replyToEmail'] || undefined
                        });
                    break;
                case Providers.FCM:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.updateFCMProvider({
                            providerId,
                            serviceAccountJSON: JSON.parse(formValues['serviceAccountJSON'])
                        });
                    break;
                case Providers.APNS:
                    response = await sdk
                        .forProject(page.params.region, page.params.project)
                        .messaging.updateAPNSProvider({
                            providerId,
                            authKey: formValues['authKey'],
                            authKeyId: formValues['authKeyId'],
                            teamId: formValues['teamId'],
                            bundleId: formValues['bundleId'],
                            sandbox: formValues['sandbox']
                        });
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
        <svelte:fragment slot="title">Settings</svelte:fragment>
        Configure the settings to <Link
            external
            href={`https://appwrite.io/docs/products/messaging/${provider}`}
            >enable {displayName}</Link> to send {message}, or <PinkLink.Button
            on:click={() => (newMemberModal = true)}>invite a team member</PinkLink.Button> to complete
        the provider settings.
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
