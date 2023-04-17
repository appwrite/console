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

    export let data: PageData;
    const projectId = $page.params.project;
    interface EmailTemplate {
        senderName: string;
        senderEmail: string;
        locale: string;
        subject: string;
        message: string;
    }
    let emailTemplates:
        | {
              verification: EmailTemplate;
              magicSession: EmailTemplate;
              recovery: EmailTemplate;
              invitation: EmailTemplate;
          }
        | any = {};

    onMount(() => {
        loadEmailTemplate('verification', 'en-us');
        loadEmailTemplate('magicSession', 'en-us');
        loadEmailTemplate('recovery', 'en-us');
        loadEmailTemplate('invitation', 'en-us');
    });
    async function loadEmailTemplate(type: string, locale: string) {
        const path = '/projects/' + projectId + '/templates/email/' + type + '/' + locale;

        try {
            emailTemplates[type] = await sdk.forConsole.client.call(
                'GET',
                new URL(sdk.forConsole.client.config.endpoint + path)
            );
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
        }
    }

    async function saveEmailTemplate(type: string, data: any) {
        console.log(data);
        const path = '/projects/' + projectId + '/templates/email/' + type + '/' + data.locale;

        try {
            emailTemplates[type] = await sdk.forConsole.client.call(
                'PATCH',
                new URL(sdk.forConsole.client.config.endpoint + path),
                { 'content-type': 'application/json' },
                {
                    senderName: data.senderName,
                    senderEmail: data.senderEmail,
                    subject: data.subject,
                    message: data.message
                }
            );
            addNotification({
                type: 'success',
                message: 'Template updated'
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
                Learn more about Email templates
            </a>. <!-- TODO Docs link -->
        </p>

        <svelte:fragment slot="aside">
            <Collapsible>
                <CollapsibleItem open>
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
                <CollapsibleItem>
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
                    <!-- <SmsTemplate onSubmit={saveEmailTemplate} /> -->
                </CollapsibleItem>
                <CollapsibleItem>
                    <svelte:fragment slot="title">Login</svelte:fragment>
                    <!-- <SmsTemplate onSubmit={saveEmailTemplate} /> -->
                </CollapsibleItem>
            </Collapsible>
        </svelte:fragment>
    </CardGrid>
</Container>
