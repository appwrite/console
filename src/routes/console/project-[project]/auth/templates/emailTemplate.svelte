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

    let openVariablesDescription = false;
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

<Form onSubmit={saveEmailTemplate}>
    <FormList>
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
            <li>
                <p class="text">
                    Click to copy the variables you can use in the fields below. For more
                    information,
                    <a class="link" href="#">click here</a>.
                </p>
                <div class="common-section u-flex u-gap-24">
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
            readonly={!$project.smtpEnabled} />
        <div class="u-flex u-gap-32 u-main-end">
            <Button on:click={() => (openResetModal = true)} text>Reset changes</Button>
            <Button submit disabled={isButtonDisabled}>Update</Button>
        </div>
    </FormList>
</Form>

<ResetEmail bind:show={openResetModal} />
