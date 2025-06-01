<script lang="ts">
    import { Button, Form, InputEmail, InputText, InputTextarea } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../store';
    import ResetEmail from './resetEmail.svelte';
    import { baseEmailTemplate, emailTemplate } from './store';
    import deepEqual from 'deep-equal';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import type { EmailTemplateLocale, EmailTemplateType } from '@appwrite.io/console';
    import { Icon, Layout, Tooltip, Typography } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import TemplateSkeleton from './templateSkeleton.svelte';

    export let loading = false;
    export let isUpdating = false;

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

    $: isSmtpEnabled = $project?.smtpEnabled;
    $: isButtonDisabled = deepEqual($emailTemplate, $baseEmailTemplate);
</script>

<div class:u-opacity-0={isUpdating} style={isUpdating ? 'pointer-events: none' : ''}>
    <Form onSubmit={saveEmailTemplate}>
        <Layout.Stack>
            {#if loading}
                <TemplateSkeleton count={3} />
            {:else}
                <InputText
                    id="senderName"
                    label="Sender name"
                    bind:value={$emailTemplate.senderName}
                    placeholder="Enter sender name"
                    disabled={!isSmtpEnabled} />

                <InputEmail
                    bind:value={$emailTemplate.senderEmail}
                    id="senderEmail"
                    label="Sender email"
                    placeholder="Enter sender email"
                    disabled={!isSmtpEnabled} />

                <InputEmail
                    bind:value={$emailTemplate.replyTo}
                    id="replyTo"
                    label="Reply to"
                    placeholder="noreply@appwrite.io" />

                {#if $$slots.default}
                    <p class="text">
                        Click to copy variables for the fields below. Learn more <a
                            class="link"
                            href="https://appwrite.io/docs/advanced/platform/message-templates"
                            >here</a
                        >.
                    </p>
                    <Layout.Stack direction="row">
                        <slot />
                    </Layout.Stack>
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
                    readonly={!isSmtpEnabled}
                    rows={8}>
                    <Tooltip slot="info" maxWidth="15rem">
                        <Icon icon={IconInfo} size="s" />
                        <Typography.Caption variant="400" slot="tooltip">
                            Set up an SMTP server to edit the message body
                        </Typography.Caption>
                    </Tooltip>
                </InputTextarea>
            {/if}
        </Layout.Stack>
        <div class="u-sep-block-start u-margin-block-start-24"></div>
        <div class="u-flex u-gap-16 u-main-end u-margin-block-start-24">
            <Button on:click={() => (openResetModal = true)} text>Reset changes</Button>
            <Button submit disabled={isButtonDisabled}>Update</Button>
        </div>
    </Form>
</div>

<ResetEmail bind:show={openResetModal} />
