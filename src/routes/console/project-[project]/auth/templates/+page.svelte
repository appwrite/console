<script context="module" lang="ts">
    export async function loadEmailTemplate(projectId: string, type: string, locale: string) {
        try {
            return await sdk.forConsole.projects.getEmailTemplate(projectId, type, locale);
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
        }
    }
    export async function loadSmsTemplate(projectId: string, type: string, locale: string) {
        try {
            return await sdk.forConsole.projects.getSmsTemplate(projectId, type, locale);
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
        }
    }

    export async function saveEmailTemplate(projectId: string, data: Models.EmailTemplate) {
        if (!data.locale) {
            addNotification({
                type: 'error',
                message: 'Locale is required'
            });
            return;
        }
        try {
            await sdk.forConsole.projects.updateEmailTemplate(
                projectId,
                data.type,
                data.locale,
                data.senderName,
                data.senderEmail,
                data.subject,
                data.message,
                data.replyTo
            );
            addNotification({
                type: 'success',
                message: `Email ${data.type} template for ${data.locale} updated`
            });
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
        }
    }

    export async function saveSmsTemplate(projectId: string, data: Models.SmsTemplate) {
        if (!data.locale) {
            addNotification({
                type: 'error',
                message: 'Locale is required'
            });
            return;
        }
        try {
            await sdk.forConsole.projects.updateSmsTemplate(
                projectId,
                data.type,
                data.locale,
                data.message
            );
            addNotification({
                type: 'success',
                message: `SMS ${data.type} template for ${data.locale} updated`
            });
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
        }
    }
</script>

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
    import { emailTemplate } from './strote';
    import type { Models } from '@appwrite.io/console';

    export let data: PageData;
    const projectId = $page.params.project;

    let emailVerificationOpen = true;
    let emailMagicSessionOpen = false;
    let emailOpen = 'verification';
    $: emailVerificationOpen = emailOpen === 'verification';
    $: emailMagicSessionOpen = emailOpen === 'magicSession';
    $: emailResetPassword = emailOpen === 'recovery';
    $: emailInviteUser = emailOpen === 'invitation';

    onMount(async () => {
        openEmail('verification');
    });

    async function openEmail(type: string) {
        emailOpen = type;
        $emailTemplate = await loadEmailTemplate(projectId, type, 'en-us');
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
                    on:click={(e) => {
                        e.preventDefault();
                        openEmail('verification');
                    }}>
                    <svelte:fragment slot="title">Verification</svelte:fragment>
                    <p class="text">
                        Send a verification email to users that sign in with their email and
                        password.
                    </p>
                    <EmailVerificationTemplate localeCodes={data.localeCodes} />
                </CollapsibleItem>
                <CollapsibleItem
                    bind:open={emailMagicSessionOpen}
                    on:click={(e) => {
                        e.preventDefault();
                        openEmail('magicSession');
                    }}>
                    <svelte:fragment slot="title">Magic URL</svelte:fragment>
                    <EmailMagicUrlTemplate localeCodes={data.localeCodes} />
                </CollapsibleItem>
                <CollapsibleItem
                    bind:open={emailResetPassword}
                    on:click={(e) => {
                        e.preventDefault();
                        openEmail('recovery');
                    }}>
                    <svelte:fragment slot="title">Reset Password</svelte:fragment>
                    <EmailRecoveryTemplate localeCodes={data.localeCodes} />
                </CollapsibleItem>
                <CollapsibleItem
                    bind:open={emailInviteUser}
                    on:click={(e) => {
                        e.preventDefault();
                        openEmail('invitation');
                    }}>
                    <svelte:fragment slot="title">Invite User</svelte:fragment>
                    <EmailInviteTemplate localeCodes={data.localeCodes} />
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
                    <SmsVerificationTemplate localeCodes={data.localeCodes} />
                </CollapsibleItem>
                <CollapsibleItem>
                    <svelte:fragment slot="title">Login</svelte:fragment>
                    <SmsLoginTemplate localeCodes={data.localeCodes} />
                </CollapsibleItem>
                <CollapsibleItem>
                    <svelte:fragment slot="title">Invitation</svelte:fragment>
                    <SmsLoginTemplate localeCodes={data.localeCodes} />
                </CollapsibleItem>
            </Collapsible>
        </svelte:fragment>
    </CardGrid>
</Container>
