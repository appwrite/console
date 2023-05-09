<script lang="ts">
    import {
        Button,
        Form,
        FormList,
        InputEmail,
        InputText,
        InputTextarea
    } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../store';
    import ResetEmail from './resetEmail.svelte';
    import { baseEmailTemplate, emailTemplate } from './strote';
    import { deepEqual } from '$lib/helpers/object';

    export let loading = false;
    let openResetModal = false;

    async function saveEmailTemplate() {
        if (!$emailTemplate.locale) {
            addNotification({
                type: 'error',
                message: 'Locale is required'
            });
            return;
        }
        try {
            await sdk.forConsole.projects.updateEmailTemplate(
                $project.$id,
                $emailTemplate.type,
                $emailTemplate.locale,
                $emailTemplate.senderName,
                $emailTemplate.senderEmail,
                $emailTemplate.subject,
                $emailTemplate.message,
                $emailTemplate.replyTo
            );
            addNotification({
                type: 'success',
                message: `Email ${$emailTemplate.type} template for ${$emailTemplate.locale} updated`
            });
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
        }
    }

    $: isButtonDisabled = deepEqual($emailTemplate, $baseEmailTemplate);
</script>

<div class="box">
    {#if loading}
        <div
            class="u-width-full-100 u-flex u-flex-vertical u-main-center u-cross-center u-gap-16 u-margin-block-start-32">
            <div class="loader" />
            <p class="text">Loading template...</p>
        </div>
    {/if}
    <div class:u-opacity-0={loading} style={loading ? 'pointer-events: none' : ''}>
        <Form onSubmit={saveEmailTemplate}>
            <FormList gap={8}>
                <InputText
                    id="senderName"
                    label="Sender Name"
                    bind:value={$emailTemplate.senderName}
                    placeholder={'{{project}}'} />
                <InputEmail
                    bind:value={$emailTemplate.senderEmail}
                    id="senderEmail"
                    label="Sender Email"
                    placeholder="Enter sender email" />
                <InputEmail id="replyTo" label="Reply to" placeholder="DoNotReply" />
                {#if $$slots.default}
                    <li style="margin-block: 1rem;">
                        <p class="text">
                            Click to copy variables for the fields below. Learn more <a
                                class="link"
                                href="#">here</a
                            >.
                        </p>
                        <div class="u-margin-block-start-16 u-flex u-gap-8">
                            <slot />
                        </div>
                    </li>
                {/if}
                <InputText
                    bind:value={$emailTemplate.subject}
                    id="subject"
                    label="Subject"
                    placeholder="Enter subject" />
                <InputTextarea
                    bind:value={$emailTemplate.message}
                    id="message"
                    label="Message"
                    placeholder="Enter your message"
                    tooltip="Set up an SMTP server to edit the message body"
                    readonly={!$project.smtpEnabled} />
            </FormList>
            <div class="u-sep-block-start u-margin-block-start-24" />
            <div class="u-flex u-gap-32 u-main-end u-margin-block-start-24">
                <Button on:click={() => (openResetModal = true)} text>Reset changes</Button>
                <Button submit disabled={isButtonDisabled}>Update</Button>
            </div>
        </Form>
    </div>
</div>

<ResetEmail bind:show={openResetModal} />
