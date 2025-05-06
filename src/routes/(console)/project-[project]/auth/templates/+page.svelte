<script context="module" lang="ts">
    export async function loadEmailTemplate(projectId: string, type: string, locale: string) {
        try {
            // TODO: fix TemplateType and TemplateLocale typing once SDK is updated
            return await sdk.forConsole.projects.getEmailTemplate(
                projectId,
                type as EmailTemplateType,
                locale as EmailTemplateLocale
            );
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
        }
    }
    export async function loadSmsTemplate(projectId: string, type: string, locale: string) {
        try {
            // TODO: fix TemplateType and TemplateLocale typing once SDK is updated
            return await sdk.forConsole.projects.getSmsTemplate(
                projectId,
                type as SmsTemplateType,
                locale as SmsTemplateLocale
            );
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
        }
    }
</script>

<script lang="ts">
    import { base } from '$app/paths';
    import { CardGrid } from '$lib/components';
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import EmailVerificationTemplate from './emailVerificationTemplate.svelte';
    import EmailMagicUrlTemplate from './emailMagicUrlTemplate.svelte';
    import EmailRecoveryTemplate from './emailRecoveryTemplate.svelte';
    import EmailInviteTemplate from './emailInviteTemplate.svelte';
    import Email2FaTemplate from './email2FATemplate.svelte';
    import EmailSessionAlertTemplate from './emailSessionAlertTemplate.svelte';

    // import SmsVerificationTemplate from './smsVerificationTemplate.svelte';
    // import SmsLoginTemplate from './smsLoginTemplate.svelte';
    // import { baseEmailTemplate, baseSmsTemplate, emailTemplate, smsTemplate } from './store';
    import { baseEmailTemplate, emailTemplate } from './store';
    import { Button } from '$lib/elements/forms';
    import { currentPlan } from '$lib/stores/organization';
    import EmailSignature from './emailSignature.svelte';
    import { isCloud } from '$lib/system';
    import type {
        SmsTemplateLocale,
        SmsTemplateType,
        EmailTemplateType,
        EmailTemplateLocale
    } from '@appwrite.io/console';
    import { Accordion, Layout, Alert, Badge, Link, Typography } from '@appwrite.io/pink-svelte';

    export let data;

    let emailOpen = null;
    $: emailVerificationOpen = emailOpen === 'verification';
    $: emailMagicSessionOpen = emailOpen === 'magicSession';
    $: emailOtpSessionOpen = emailOpen === 'otpSession';
    $: emailResetPassword = emailOpen === 'recovery';
    $: emailInviteUser = emailOpen === 'invitation';
    $: email2FAVerificationOpen = emailOpen === 'mfaChallenge';
    $: emailSessionAlertOpen = emailOpen === 'sessionAlert';

    openEmail('verification');

    async function openEmail(type: string) {
        type === emailOpen ? (emailOpen = null) : (emailOpen = type);
        $emailTemplate = await loadEmailTemplate(data.project.$id, type, 'en');
        $baseEmailTemplate = { ...$emailTemplate };
    }
</script>

<Container>
    {#if !data.project.smtpEnabled}
        <Alert.Inline
            dismissible={false}
            status="info"
            title="Custom SMTP server is required for customizing emails">
            Configure a custom SMTP server to enable custom email templates and prevent emails from
            being labeled as spam.
            <Button
                compact
                slot="actions"
                href={`${base}/project-${data.project.$id}/settings/smtp`}>
                SMTP settings
            </Button>
        </Alert.Inline>
    {/if}

    <CardGrid>
        <svelte:fragment slot="title">
            Email templates <Badge variant="secondary" content="Experimental" />
        </svelte:fragment>
        Use templates to send and process account management emails.
        <Link.Anchor
            target="_blank"
            href="https://appwrite.io/docs/advanced/platform/message-templates">
            Learn more
        </Link.Anchor>
        <svelte:fragment slot="aside">
            <Layout.Stack>
                <Accordion
                    title="Verification"
                    bind:open={emailVerificationOpen}
                    on:click={() => openEmail('verification')}>
                    <Layout.Stack>
                        <Typography.Text>
                            Send a verification email to users that sign in with their email and
                            password.
                        </Typography.Text>
                        <EmailVerificationTemplate />
                    </Layout.Stack>
                </Accordion>
                <Accordion
                    title="Magic URL"
                    bind:open={emailMagicSessionOpen}
                    on:click={(e) => {
                        e.preventDefault();
                        openEmail('magicSession');
                    }}>
                    Send an email to users that sign in with a magic URL.
                    <EmailMagicUrlTemplate />
                </Accordion>
                <Accordion
                    title="OTP session"
                    bind:open={emailOtpSessionOpen}
                    on:click={(e) => {
                        e.preventDefault();
                        openEmail('otpSession');
                    }}>
                    Send an email to users that sign in with a email OTP.
                    <EmailMagicUrlTemplate />
                </Accordion>
                <Accordion
                    title="Reset password"
                    bind:open={emailResetPassword}
                    on:click={(e) => {
                        e.preventDefault();
                        openEmail('recovery');
                    }}>
                    Send a recovery email to users that forget their password.
                    <EmailRecoveryTemplate />
                </Accordion>
                <Accordion
                    title="Invite user"
                    bind:open={emailInviteUser}
                    on:click={(e) => {
                        e.preventDefault();
                        openEmail('invitation');
                    }}>
                    Send an invitation email to become a member of your project.
                    <EmailInviteTemplate />
                </Accordion>
                <Accordion
                    title="2FA verification"
                    bind:open={email2FAVerificationOpen}
                    on:click={(e) => {
                        e.preventDefault();
                        openEmail('mfaChallenge');
                    }}>
                    Send a two-factor authentication email to a user.
                    <Email2FaTemplate />
                </Accordion>
                <Accordion
                    title="Session alert"
                    bind:open={emailSessionAlertOpen}
                    on:click={(e) => {
                        e.preventDefault();
                        openEmail('sessionAlert');
                    }}>
                    Send an email to users when a new session is created.
                    <EmailSessionAlertTemplate />
                </Accordion>
            </Layout.Stack>
        </svelte:fragment>
        <svelte:fragment slot="actions">
            <Button href={`${base}/project-${data.project.$id}/settings/smtp`} secondary>
                SMTP settings
            </Button>
        </svelte:fragment>
    </CardGrid>
    {#if isCloud && $currentPlan.emailBranding}
        <EmailSignature />
    {/if}
</Container>
