<script lang="ts">
    import { messageParams, providerType } from './store';

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
    import { Modal } from '$lib/components';
    import { user } from '$lib/stores/user';
    import { clickOnEnter } from '$lib/helpers/a11y';
    import { sdk } from '$lib/stores/sdk';

    import { ID, MessagingProviderType } from '@appwrite.io/console';
    import { page } from '$app/stores';
    import Alert from '$lib/components/alert.svelte';

    let showCustomId = false;
    let showTest = false;
    let selected = 'self';

    let otherEmail = '';

    async function sendTestEmail() {
        const email = selected === 'self' ? $user.email : otherEmail;
        console.log(email);

        // TODO: replace with test method
        sdk.forProject.messaging.createEmail(
            ID.unique(),
            $messageParams[MessagingProviderType.Email]?.subject || undefined,
            $messageParams[MessagingProviderType.Email]?.content || undefined,
            $messageParams[MessagingProviderType.Email]?.topics || [],
            $messageParams[MessagingProviderType.Email]?.users || [],
            $messageParams[MessagingProviderType.Email]?.targets || [],
            undefined,
            undefined,
            undefined,
            undefined,
            $messageParams[MessagingProviderType.Email]?.html || false,
            undefined
        );
    }

    $: otherEmail = selected === 'self' ? '' : otherEmail;
</script>

{#if $page.data.providers.providers.filter((provider) => provider.type === MessagingProviderType.Email).length === 0}
    <div style="margin-bottom:1.4rem">
        <Alert type="warning">
            <span slot="title">Enable a third-party provider</span>
            <p>
                All providers are currently disabled. Enable a third-party provider for sending
                emails.
            </p>
        </Alert>
    </div>
{/if}

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
                name="selected">
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
    {#if !showCustomId}
        <div>
            <Pill button on:click={() => (showCustomId = !showCustomId)}
                ><span class="icon-pencil" aria-hidden="true" /><span class="text">
                    Message ID
                </span></Pill>
        </div>
    {/if}
</FormList>
