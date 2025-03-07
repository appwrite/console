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
    import { CustomId, Modal } from '$lib/components';
    import { user } from '$lib/stores/user';
    import { clickOnEnter } from '$lib/helpers/a11y';
    import { ID, MessagingProviderType } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackEvent } from '$lib/actions/analytics';

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

<FormList>
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
            <Pill button on:click={() => (showCustomId = !showCustomId)}
                ><span class="icon-pencil" aria-hidden="true" /><span class="text">
                    Message ID
                </span></Pill>
        </div>
    {:else}
        <CustomId
            autofocus
            bind:show={showCustomId}
            name="Message"
            bind:id={$messageParams[$providerType].messageId}
            fullWidth />
    {/if}
</FormList>
