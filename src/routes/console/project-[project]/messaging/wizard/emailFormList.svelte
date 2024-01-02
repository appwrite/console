<script context="module" lang="ts">
    export async function createEmailMessage(params: EmailMessageParams) {
        const response = await sdk.forProject.client.call(
            'POST',
            new URL(sdk.forProject.client.config.endpoint + '/messaging/messages/email'),
            {
                'X-Appwrite-Project': sdk.forProject.client.config.project,
                'content-type': 'application/json',
                'X-Appwrite-Mode': 'admin'
            },
            params
        );

        return response.json();
    }
</script>

<script lang="ts">
    import { messageParams, providerType, type EmailMessageParams, MessageStatuses } from './store';
    import {
        Button,
        FormList,
        InputEmail,
        InputRadio,
        InputSwitch,
        InputText,
        InputTextarea
    } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
    import { CustomId, Modal } from '$lib/components';
    import { user } from '$lib/stores/user';
    import { clickOnEnter } from '$lib/helpers/a11y';
    import { ID } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';
    import { ProviderTypes } from '../providerType.svelte';

    let showCustomId = false;
    let showTest = false;
    let selected = 'self';
    let otherEmail = '';

    async function sendTestEmail() {
        const email = selected === 'self' ? $user.email : otherEmail;
        console.log(email);

        createEmailMessage({
            topics: $messageParams[ProviderTypes.Email]?.topics || [],
            targets: $messageParams[ProviderTypes.Email]?.targets || [],
            description: $messageParams[ProviderTypes.Email]?.description || 'Test message',
            status: MessageStatuses.PROCESSING,
            messageId: ID.unique(),
            // TODO: properly handle the test email address
            users: ['steven'],
            subject: $messageParams[ProviderTypes.Email]?.subject || '',
            content: $messageParams[ProviderTypes.Email]?.content || '',
            html: $messageParams[ProviderTypes.Email]?.html || false
        });
    }

    $: otherEmail = selected === 'self' ? '' : otherEmail;
</script>

<FormList>
    <InputText
        id="subject"
        label="Subject"
        placeholder="Enter subject"
        bind:value={$messageParams[$providerType]['subject']}>
    </InputText>
    <div class="u-colum-gap-2">
        <InputTextarea
            id="message"
            label="Message"
            placeholder="Type here..."
            bind:value={$messageParams[$providerType]['content']}>
        </InputTextarea>
        <!-- TODO: Add support for draft messages -->
        <!-- <div class="u-flex u-main-end">
            <Button text on:click={() => (showTest = true)}>Send test message</Button>
        </div> -->
        <Modal title="Send test message" bind:show={showTest} onSubmit={sendTestEmail} size="big">
            <slot />
            <InputRadio
                label={$user.email}
                bind:group={selected}
                value="self"
                id="self"
                name="selected" />
            <InputRadio
                label="Other"
                bind:group={selected}
                value="other"
                id="other"
                name="selected"
                fullWidth>
                <svelte:fragment slot="description">
                    Enter the email address to which te test message will be
                    <div
                        on:click={() => (selected = 'other')}
                        on:keyup|self={clickOnEnter}
                        role="button"
                        tabindex="0">
                        <InputEmail
                            showLabel={false}
                            id="email"
                            label="Email"
                            placeholder="Enter email"
                            bind:value={otherEmail} />
                    </div>
                </svelte:fragment>
            </InputRadio>

            <svelte:fragment slot="footer">
                <Button secondary on:click={() => (showTest = false)}>Cancel</Button>
                <Button submit>Send</Button>
            </svelte:fragment>
        </Modal>
    </div>
    <InputSwitch label="HTML mode" id="html" bind:value={$messageParams[$providerType]['html']}>
        <svelte:fragment slot="description">
            Enable the HTML mode if your message contains HTML tags.
        </svelte:fragment>
    </InputSwitch>
    <InputText
        id="description"
        label="Description"
        placeholder="Enter description"
        tooltip="Provide a summary of the message. Users won't see this description."
        bind:value={$messageParams[$providerType]['description']}>
    </InputText>
    {#if !showCustomId}
        <div>
            <Pill button on:click={() => (showCustomId = !showCustomId)}
                ><span class="icon-pencil" aria-hidden="true" /><span class="text">
                    Message ID
                </span></Pill>
        </div>
    {:else}
        <CustomId
            bind:show={showCustomId}
            name="Message"
            bind:id={$messageParams[$providerType].messageId}
            autofocus={false} />
    {/if}
</FormList>
