<script lang="ts">
    import { messageParams, providerType } from './store';
    import {
        Button,
        InputEmail,
        InputRadio,
        InputSwitch,
        InputText,
        InputTextarea
    } from '$lib/elements/forms';
    import { Badge, Icon } from '@appwrite.io/pink-svelte';
    import { IconPencil } from '@appwrite.io/pink-icons-svelte';
    import { CustomId, Modal } from '$lib/components';
    import { user } from '$lib/stores/user';
    import { clickOnEnter } from '$lib/helpers/a11y';
    import { ID, MessagingProviderType } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import { page } from '$app/state';

    let showCustomId = false;
    let showTest = false;
    let selected = 'self';
    let otherEmail = '';

    async function sendTestEmail() {
        // TODO: replace with test method
        sdk.forProject(page.params.region, page.params.project).messaging.createEmail({
            messageId: ID.unique(),
            subject: $messageParams[MessagingProviderType.Email]?.subject || undefined,
            content: $messageParams[MessagingProviderType.Email]?.content || undefined,
            topics: $messageParams[MessagingProviderType.Email]?.topics || [],
            users: $messageParams[MessagingProviderType.Email]?.users || [],
            targets: $messageParams[MessagingProviderType.Email]?.targets || [],
            html: $messageParams[MessagingProviderType.Email]?.html || false
        });
    }

    $: otherEmail = selected === 'self' ? '' : otherEmail;
</script>

<InputText
    id="subject"
    label="Subject"
    required
    placeholder="Enter subject"
    bind:value={$messageParams[$providerType]['subject']}>
</InputText>
<div class="u-colum-gap-2">
    <InputTextarea
        id="message"
        label="Message"
        required
        placeholder="Type here..."
        bind:value={$messageParams[$providerType]['content']}>
    </InputTextarea>
    <!-- <div class="u-flex u-main-end">
            <Button text on:click={() => (showTest = true)}>Send test message</Button>
        </div> -->
    <Modal title="Send test message" bind:show={showTest} onSubmit={sendTestEmail} size="l">
        <slot />
        <InputRadio
            label={$user.email}
            bind:group={selected}
            value="self"
            id="self"
            name="selected" />
        <InputRadio label="Other" bind:group={selected} value="other" id="other" name="selected">
            <svelte:fragment slot="description">
                Enter the email address to which te test message will be
                <div
                    on:click={() => (selected = 'other')}
                    on:keyup|self={clickOnEnter}
                    role="button"
                    tabindex="0">
                    <InputEmail
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
<InputSwitch
    label="HTML mode"
    id="html"
    bind:value={$messageParams[$providerType]['html']}
    on:change={() => {
        trackEvent(Submit.MessagingUpdateHtmlMode);
    }}>
    <svelte:fragment slot="description">
        Enable the HTML mode if your message contains HTML tags.
    </svelte:fragment>
</InputSwitch>
{#if !showCustomId}
    <div>
        <Badge
            variant="secondary"
            content="Message ID"
            on:click={() => (showCustomId = !showCustomId)}>
            <Icon icon={IconPencil} size="s" slot="start" />
        </Badge>
    </div>
{:else}
    <CustomId
        autofocus
        name="Message"
        bind:show={showCustomId}
        bind:id={$messageParams[$providerType].messageId} />
{/if}
