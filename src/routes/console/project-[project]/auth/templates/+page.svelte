<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Alert, CardGrid, Collapsible, CollapsibleItem, Heading } from '$lib/components';
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../store';
    import { addNotification } from '$lib/stores/notifications';
    import { onMount } from 'svelte';
    import type { PageData } from './$types';
    import EmailVerificationTemplate from './emailVerificationTemplate.svelte';
    import EmailMagicUrlTemplate from './emailMagicUrlTemplate.svelte';
    import EmailRecoveryTemplate from './emailRecoveryTemplate.svelte';
    import EmailInviteTemplate from './emailInviteTemplate.svelte';
    import SmsVerificationTemplate from './smsVerificationTemplate.svelte';
    import SmsLoginTemplate from './smsLoginTemplate.svelte';
    import type { Models } from '@appwrite.io/console';

    export let data: PageData;
    const projectId = $page.params.project;

    let emailTemplates:
        | {
              verification: Models.EmailTemplate;
              magicSession: Models.EmailTemplate;
              recovery: Models.EmailTemplate;
              invitation: Models.EmailTemplate;
          }
        | any = {};
    let smsTemplates:
        | {
              verification: Models.SmsTemplate;
              login: Models.SmsTemplate;
              invitation: Models.SmsTemplate;
          }
        | any = {};

    let emailVerificationOpen = true;
    let emailMagicSessionOpen = false;
    let emailOpen = 'verification';
    $: emailVerificationOpen = emailOpen === 'verification';
    $: emailMagicSessionOpen = emailOpen === 'magicSession';

    onMount(() => {
        loadEmailTemplate('verification', 'en-us');
        loadEmailTemplate('magicSession', 'en-us');
        loadEmailTemplate('recovery', 'en-us');
        loadEmailTemplate('invitation', 'en-us');
        loadSmsTemplate('verification', 'en-us');
        loadSmsTemplate('login', 'en-us');
        loadSmsTemplate('invitation', 'en-us');
    });
    async function loadEmailTemplate(type: string, locale: string) {
        try {
            emailTemplates[type] = await sdk.forConsole.projects.getEmailTemplate(
                projectId,
                type,
                locale
            );
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
        }
    }
    async function loadSmsTemplate(type: string, locale: string) {
        try {
            smsTemplates[type] = await sdk.forConsole.projects.getSmsTemplate(
                projectId,
                type,
                locale
            );
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
        }
    }

    async function saveEmailTemplate(type: string, data: any) {
        if (!data.locale) {
            addNotification({
                type: 'error',
                message: 'Locale is required'
            });
            return;
        }
        try {
            emailTemplates[type] = await sdk.forConsole.projects.updateEmailTemplate(
                projectId,
                type,
                data.locale,
                data.senderName,
                data.senderEmail,
                data.subject,
                data.message,
                data.replyTo
            );
            addNotification({
                type: 'success',
                message: `Email ${type} template for ${data.locale} updated`
            });
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
        }
    }

    async function saveSmsTemplate(type: string, data: any) {
        if (!data.locale) {
            addNotification({
                type: 'error',
                message: 'Locale is required'
            });
            return;
        }
        try {
            emailTemplates[type] = await sdk.forConsole.projects.updateSmsTemplate(
                projectId,
                type,
                data.locale,
                data.message
            );
            addNotification({
                type: 'success',
                message: `SMS ${type} template for ${data.locale} updated`
            });
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
        }
    }
</script>

<Container>
    {#if !$project.smtpEnabled}
        <Alert
            dismissible
            type="info"
            buttons={[
                {
                    name: 'Add SMTP server',
                    method: () => {
                        goto(base + '/console/project-' + $project.$id + '/settings/smtp');
                    }
                }
            ]}>
            <svelte:fragment slot="title">
                Custom SMTP server is required for customizing emails
            </svelte:fragment>
            Configure a custom SMTP server to enable custom email templates and prevent emails from being
            labeled as spam.
        </Alert>
    {/if}

    <CardGrid>
        <Heading size="6" tag="h6">Email Templates</Heading>
        <p class="text">
            Use templates to send and process account management emails. <a
                href="https://appwrite.io/docs"
                class="link">
                Learn more about Email templates.
            </a>
            <!-- TODO Docs link -->
        </p>

        <svelte:fragment slot="aside">
            <Collapsible>
                <CollapsibleItem
                    bind:open={emailVerificationOpen}
                    on:click={() => {
                        emailOpen = 'verification';
                    }}>
                    <svelte:fragment slot="title">Verification</svelte:fragment>
                    <p class="text">
                        Send a verification email to users that sign in with their email and
                        password.
                    </p>
                    <EmailVerificationTemplate
                        {loadEmailTemplate}
                        {saveEmailTemplate}
                        localeCodes={data.localeCodes}
                        template={emailTemplates?.verification} />
                </CollapsibleItem>
                <CollapsibleItem
                    bind:open={emailMagicSessionOpen}
                    on:click={() => {
                        emailOpen = 'magicSession';
                    }}>
                    <svelte:fragment slot="title">Magic URL</svelte:fragment>
                    <EmailMagicUrlTemplate
                        {loadEmailTemplate}
                        {saveEmailTemplate}
                        localeCodes={data.localeCodes}
                        template={emailTemplates?.magicSession} />
                </CollapsibleItem>
                <CollapsibleItem>
                    <svelte:fragment slot="title">Reset Password</svelte:fragment>
                    <EmailRecoveryTemplate
                        {loadEmailTemplate}
                        {saveEmailTemplate}
                        localeCodes={data.localeCodes}
                        template={emailTemplates?.recovery} />
                </CollapsibleItem>
                <CollapsibleItem>
                    <svelte:fragment slot="title">Invite User</svelte:fragment>
                    <EmailInviteTemplate
                        {loadEmailTemplate}
                        {saveEmailTemplate}
                        localeCodes={data.localeCodes}
                        template={emailTemplates?.invitation} />
                </CollapsibleItem>
            </Collapsible>
        </svelte:fragment>
    </CardGrid>

    <CardGrid>
        <Heading size="6" tag="h6">SMS Templates</Heading>
        <p class="text">
            Use templates to send and process account management mobile messages. <a
                href="https://appwrite.io/docs"
                class="link">
                Learn more about SMS templates
            </a>. <!-- TODO Docs link -->
        </p>

        <svelte:fragment slot="aside">
            <Collapsible>
                <CollapsibleItem>
                    <svelte:fragment slot="title">Verification</svelte:fragment>
                    <p class="text">
                        Send a verification SMS to users that sign in with their phone
                    </p>
                    <SmsVerificationTemplate
                        localeCodes={data.localeCodes}
                        {loadSmsTemplate}
                        {saveSmsTemplate}
                        template={smsTemplates?.verification} />
                </CollapsibleItem>
                <CollapsibleItem>
                    <svelte:fragment slot="title">Login</svelte:fragment>
                    <SmsLoginTemplate
                        localeCodes={data.localeCodes}
                        {loadSmsTemplate}
                        {saveSmsTemplate}
                        template={smsTemplates?.login} />
                </CollapsibleItem>
                <CollapsibleItem>
                    <svelte:fragment slot="title">Invitation</svelte:fragment>
                    <SmsLoginTemplate
                        localeCodes={data.localeCodes}
                        {loadSmsTemplate}
                        {saveSmsTemplate}
                        template={smsTemplates?.invitation} />
                </CollapsibleItem>
            </Collapsible>
        </svelte:fragment>
    </CardGrid>
</Container>
