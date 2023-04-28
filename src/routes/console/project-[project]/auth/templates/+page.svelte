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
    import { baseEmailTemplate, baseSmsTemplate, emailTemplate, smsTemplate } from './strote';
    import { Button } from '$lib/elements/forms';

    export let data: PageData;
    const projectId = $page.params.project;

    let emailOpen = 'verification';
    $: emailVerificationOpen = emailOpen === 'verification';
    $: emailMagicSessionOpen = emailOpen === 'magicSession';
    $: emailResetPassword = emailOpen === 'recovery';
    $: emailInviteUser = emailOpen === 'invitation';

    let smsOpen = 'verification';
    $: smsVerificationOpen = smsOpen === 'verification';
    $: smsLoginOpen = smsOpen === 'login';
    $: smsInvitationOpen = smsOpen === 'invitation';

    onMount(async () => {
        openEmail('verification');
        openSms('verification');
    });

    async function openEmail(type: string) {
        emailOpen = type;
        $emailTemplate = await loadEmailTemplate(projectId, type, 'en-us');
        $baseEmailTemplate = { ...$emailTemplate };
    }
    async function openSms(type: string) {
        smsOpen = type;
        $smsTemplate = await loadSmsTemplate(projectId, type, 'en-us');
        $baseSmsTemplate = { ...$smsTemplate };
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
        <Heading size="6" tag="h6">
            <div class="u-flex u-gap-8">
                Email Templates
                <div class="tag eyebrow-heading-3">
                    <span class="text u-x-small">Beta</span>
                </div>
            </div>
        </Heading>
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
        <svelte:fragment slot="actions">
            <Button href={base + '/console/project-' + $project.$id + '/settings/smtp'} secondary>
                SMTP settings
            </Button>
        </svelte:fragment>
    </CardGrid>

    <CardGrid>
        <Heading size="6" tag="h6">
            <div class="u-flex u-gap-8">
                SMS Templates
                <div class="tag eyebrow-heading-3">
                    <span class="text u-x-small">Beta</span>
                </div>
            </div>
        </Heading>
        <p class="text">
            Use templates to send and process account management mobile messages. <a
                href="https://appwrite.io/docs"
                class="link">
                Learn more about SMS templates
            </a>. <!-- TODO Docs link -->
        </p>

        <svelte:fragment slot="aside">
            <Collapsible>
                <CollapsibleItem
                    bind:open={smsVerificationOpen}
                    on:click={(e) => {
                        e.preventDefault();
                        openSms('verification');
                    }}>
                    <svelte:fragment slot="title">Verification</svelte:fragment>
                    <p class="text">
                        Send a verification SMS to users that sign in with their phone
                    </p>
                    <SmsVerificationTemplate localeCodes={data.localeCodes} />
                </CollapsibleItem>
                <CollapsibleItem
                    bind:open={smsLoginOpen}
                    on:click={(e) => {
                        e.preventDefault();
                        openSms('login');
                    }}>
                    <svelte:fragment slot="title">Login</svelte:fragment>
                    <SmsLoginTemplate localeCodes={data.localeCodes} />
                </CollapsibleItem>
                <CollapsibleItem
                    bind:open={smsInvitationOpen}
                    on:click={(e) => {
                        e.preventDefault();
                        openSms('invitation');
                    }}>
                    <svelte:fragment slot="title">Invitation</svelte:fragment>
                    <SmsLoginTemplate localeCodes={data.localeCodes} />
                </CollapsibleItem>
            </Collapsible>
        </svelte:fragment>
    </CardGrid>
</Container>
