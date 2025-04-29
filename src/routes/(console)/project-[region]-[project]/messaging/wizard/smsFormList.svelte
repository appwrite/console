<script lang="ts">
    import { messageParams, providerType } from './store';
    import { Button, InputEmail, InputRadio, InputTextarea } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
    import { CustomId, Modal } from '$lib/components';
    import { user } from '$lib/stores/user';
    import { clickOnEnter } from '$lib/helpers/a11y';
    import { ID, MessagingProviderType } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';
    import SMSPhone from '../smsPhone.svelte';

    let showCustomId = false;
    let showTest = false;
    let selected = 'self';
    let otherEmail = '';

    async function sendTestSMS() {
        // const email = selected === 'self' ? $user.email : otherEmail;

        // TODO: replace with test method
        sdk.forProject.messaging.createSms(
            ID.unique(),
            $messageParams[MessagingProviderType.Sms]?.content || undefined,
            $messageParams[MessagingProviderType.Sms]?.topics || [],
            $messageParams[MessagingProviderType.Sms]?.users || [],
            $messageParams[MessagingProviderType.Sms]?.targets || [],
            undefined,
            undefined
        );
    }

    $: otherEmail = selected === 'self' ? '' : otherEmail;
</script>

<div class="u-flex u-gap-24">
    <div class="u-colum-gap-2">
        <InputTextarea
            id="message"
            label="Message"
            required
            maxlength={900}
            placeholder="Type here..."
            bind:value={$messageParams[$providerType]['content']}>
        </InputTextarea>
        <!-- TODO: Add support for draft messages -->
        <!-- <div class="u-flex u-main-end">
                <Button text on:click={() => (showTest = true)}>Send test message</Button>
            </div> -->
        <Modal title="Send test message" bind:show={showTest} onSubmit={sendTestSMS} size="l">
            <slot />
            <InputRadio
                label={$user.phone}
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
                    Enter the phone number to which the test message will be
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
    {#if !showCustomId}
        <div>
            <Pill button on:click={() => (showCustomId = !showCustomId)}
                ><span class="icon-pencil" aria-hidden="true"></span><span class="text">
                    Message ID
                </span></Pill>
        </div>
    {:else}
        <CustomId
            autofocus
            name="Message"
            bind:show={showCustomId}
            bind:id={$messageParams[$providerType].messageId} />
    {/if}

    <SMSPhone content={$messageParams[$providerType]['content']} classes="is-only-desktop" />
</div>
<div class="u-flex u-main-center u-margin-block-start-24 is-not-desktop">
    <SMSPhone content={$messageParams[$providerType]['content']} />
</div>
