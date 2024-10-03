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
    import { baseEmailTemplate, emailTemplate } from './store';
    import deepEqual from 'deep-equal';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Box } from '$lib/components';
    import type { EmailTemplateLocale, EmailTemplateType } from '@appwrite.io/console';

    export let loading = false;
    let openResetModal = false;

    let eventType = Submit.EmailUpdateInviteTemplate;

    async function saveEmailTemplate() {
        if (!$emailTemplate.locale) {
            addNotification({
                type: 'error',
                message: 'Locale is required'
            });
            return;
        }

        // TODO: uncomment after SDK is updated
        // if (!isValueOfStringEnum(TemplateType, $emailTemplate.type)) {
        //     throw new Error(`Invalid template type: ${$emailTemplate.type}`);
        // }
        // if (!isValueOfStringEnum(TemplateLocale, $emailTemplate.locale)) {
        //     throw new Error(`Invalid template locale: ${$emailTemplate.locale}`);
        // }
        try {
            switch ($emailTemplate.type) {
                case 'invitation':
                    eventType = Submit.EmailUpdateInviteTemplate;
                    break;
                case 'magicSession':
                    eventType = Submit.EmailUpdateMagicUrlTemplate;
                    break;
                case 'recovery':
                    eventType = Submit.EmailUpdateRecoveryTemplate;
                    break;
                case 'verification':
                    eventType = Submit.EmailUpdateVerificationTemplate;
                    break;
            }
            // TODO: fix TemplateType and TemplateLocale typing once SDK is updated
            await sdk.forConsole.projects.updateEmailTemplate(
                $project.$id,
                $emailTemplate.type ? ($emailTemplate.type as EmailTemplateType) : undefined,
                $emailTemplate.locale ? ($emailTemplate.locale as EmailTemplateLocale) : undefined,
                $emailTemplate.subject ? $emailTemplate.subject : undefined,
                $emailTemplate.message ? $emailTemplate.message : undefined,
                $emailTemplate.senderName ? $emailTemplate.senderName : undefined,
                $emailTemplate.senderEmail ? $emailTemplate.senderEmail : undefined,
                $emailTemplate.replyTo ? $emailTemplate.replyTo : undefined
            );

            $baseEmailTemplate = {
                ...$emailTemplate
            };

            addNotification({
                type: 'success',
                message: `Email ${$emailTemplate.type} template for ${$emailTemplate.locale} updated`
            });
            trackEvent(eventType, {
                locale: $emailTemplate.locale
            });
        } catch (e) {
            trackError(e, eventType);
            addNotification({
                type: 'error',
                message: e.message
            });
        }
    }

    $: isButtonDisabled = deepEqual($emailTemplate, $baseEmailTemplate);

    $: isSmtpEnabled = $project?.smtpEnabled;
</script>

<Box class="u-position-relative">
    {#if loading}
        <div
            class="u-position-absolute u-width-full-line u-flex u-flex-vertical u-main-center u-cross-center u-gap-16 u-margin-block-start-32"
            style="inset-inline-start: 0;">
            <div class="loader" />
            <p class="text">Loading template...</p>
        </div>
    {/if}
    <div class:u-opacity-0={loading} style={loading ? 'pointer-events: none' : ''}>
        <Form onSubmit={saveEmailTemplate}>
            <FormList gap={8}>
                <InputText
                    id="senderName"
                    label="Sender name"
                    bind:value={$emailTemplate.senderName}
                    tooltip="Set up an SMTP server to edit the sender name"
                    placeholder="Enter sender name"
                    readonly={!isSmtpEnabled} />
                <InputEmail
                    bind:value={$emailTemplate.senderEmail}
                    id="senderEmail"
                    label="Sender email"
                    tooltip="Set up an SMTP server to edit the sender email"
                    placeholder="Enter sender email"
                    readonly={!isSmtpEnabled} />
                <InputEmail
                    bind:value={$emailTemplate.replyTo}
                    id="replyTo"
                    label="Reply to"
                    placeholder="noreply@appwrite.io" />
                {#if $$slots.default}
                    <li style="margin-block: 1rem;">
                        <p class="text">
                            Click to copy variables for the fields below. Learn more <a
                                class="link"
                                href="https://appwrite.io/docs/advanced/platform/message-templates"
                                >here</a
                            >.
                        </p>
                        <div class="u-margin-block-start-16 u-flex u-flex-wrap u-gap-8">
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
                    readonly={!isSmtpEnabled} />
            </FormList>
            <div class="u-sep-block-start u-margin-block-start-24" />
            <div class="u-flex u-gap-16 u-main-end u-margin-block-start-24">
                <Button on:click={() => (openResetModal = true)} text>Reset changes</Button>
                <Button submit disabled={isButtonDisabled}>Update</Button>
            </div>
        </Form>
    </div>
</Box>

<ResetEmail bind:show={openResetModal} />
