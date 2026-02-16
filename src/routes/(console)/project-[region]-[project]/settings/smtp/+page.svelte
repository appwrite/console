<script lang="ts">
    import { CardGrid } from '$lib/components';
    import { Button, Form, InputText, InputEmail } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import InputPassword from '$lib/elements/forms/inputPassword.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import InputNumber from '$lib/elements/forms/inputNumber.svelte';
    import { resolve } from '$app/paths';
    import deepEqual from 'deep-equal';
    import { currentPlan } from '$lib/stores/organization';
    import { type SMTPSecure } from '@appwrite.io/console';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import { getChangePlanUrl } from '$lib/stores/billing';
    import { Link, Selector, Alert } from '@appwrite.io/pink-svelte';
    import type { PageProps } from './$types';
    import { isCloud } from '$lib/system';

    const { data }: PageProps = $props();

    const { project } = data;

    let enabled: boolean = $state(false);

    let replyTo: string = $state('');
    let senderName: string = $state('');
    let senderEmail: string = $state('');

    let host: string = $state('');
    let port: number = $state(null);

    let username: string = $state('');
    let password: string = $state('');

    let secure: string = $state('');

    const options = [
        { value: 'tls', label: 'TLS' },
        { value: 'ssl', label: 'SSL' },
        { value: '', label: 'None' }
    ];

    const isButtonDisabled = $derived.by(() => {
        return deepEqual(
            {
                enabled,
                senderName,
                senderEmail,
                replyTo,
                host,
                port: port ?? '',
                username,
                password,
                secure
            },
            {
                enabled: project.smtpEnabled,
                senderName: project.smtpSenderName,
                senderEmail: project.smtpSenderEmail,
                replyTo: project.smtpReplyTo,
                host: project.smtpHost,
                port: project.smtpPort,
                username: project.smtpUsername,
                password: project.smtpPassword,
                secure: project.smtpSecure
            }
        );
    });

    async function updateSmtp() {
        try {
            await sdk.forConsole.projects.updateSMTP({
                projectId: project.$id,
                enabled,
                senderName: senderName || undefined,
                senderEmail: senderEmail || undefined,
                replyTo: replyTo || undefined,
                host: host || undefined,
                port: port || undefined,
                username: username || undefined,
                password: password || undefined,
                secure: secure ? (secure as SMTPSecure) : undefined
            });

            invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: `SMTP server has been ${enabled ? 'enabled.' : 'disabled.'}`
            });
            trackEvent(Submit.ProjectUpdateSMTP);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.ProjectUpdateSMTP);
        }
    }

    $effect(() => {
        enabled = project.smtpEnabled ?? false;
        senderName = project.smtpSenderName;
        senderEmail = project.smtpSenderEmail;
        replyTo = project.smtpReplyTo;
        host = project.smtpHost;
        port = project.smtpPort;
        username = project.smtpUsername;
        password = project.smtpPassword;
        secure = project.smtpSecure === 'tls' ? 'tls' : project.smtpSecure === 'ssl' ? 'ssl' : '';
    });

    $effect(() => {
        if (!enabled) {
            senderName = '';
            senderEmail = '';
            replyTo = '';
            host = '';
            port = null;
            username = '';
            password = '';
            secure = '';
        }
    });
</script>

<Container>
    <Form onSubmit={updateSmtp}>
        <CardGrid>
            <svelte:fragment slot="title">SMTP server</svelte:fragment>
            You can customize the email service by providing your own SMTP server. View your email templates
            <Link.Anchor
                href={resolve('/(console)/project-[region]-[project]/auth/templates', {
                    project: project.$id,
                    region: project.region
                })}>here</Link.Anchor>
            <svelte:fragment slot="aside">
                {#if isCloud && !$currentPlan.customSmtp}
                    <Alert.Inline
                        status="info"
                        title="Custom SMTP is a paid plan feature. Upgrade to enable custom SMTP server.">
                        <svelte:fragment slot="actions">
                            <Button
                                compact
                                href={getChangePlanUrl(project.teamId)}
                                on:click={() => {
                                    trackEvent(Click.OrganizationClickUpgrade, {
                                        source: 'project_settings'
                                    });
                                }}>Upgrade plan</Button>
                        </svelte:fragment>
                    </Alert.Inline>
                {:else}
                    <Selector.Switch
                        id="enabled"
                        bind:checked={enabled}
                        label="Custom SMTP server"
                        description="Enabling this option allows customizing email templates and prevents emails
                from being labeled as spam." />

                    {#if enabled}
                        <InputText
                            id="senderName"
                            label="Sender name"
                            bind:value={senderName}
                            required
                            placeholder="Enter sender name" />
                        <InputEmail
                            id="senderEmail"
                            label="Sender email"
                            bind:value={senderEmail}
                            required
                            placeholder="user@example.io" />
                        <InputEmail
                            id="replyTo"
                            label="Reply to"
                            bind:value={replyTo}
                            placeholder="user@example.io" />
                        <InputText
                            id="serverHost"
                            label="Server host"
                            bind:value={host}
                            required
                            placeholder="smtp.server.com" />
                        <InputNumber
                            id="serverPort"
                            label="Server port"
                            bind:value={port}
                            required
                            placeholder="587" />
                        <InputText
                            id="username"
                            label="Username"
                            bind:value={username}
                            placeholder="Enter username" />
                        <InputPassword
                            id="passwort"
                            label="Password"
                            bind:value={password}
                            placeholder="Enter password" />
                        <InputSelect
                            id="tls"
                            label="Secure protocol"
                            placeholder="Select protocol"
                            bind:value={secure}
                            {options} />
                    {/if}
                {/if}
            </svelte:fragment>
            <svelte:fragment slot="actions">
                <Button submit disabled={isButtonDisabled || (isCloud && !$currentPlan.customSmtp)}>
                    Update
                </Button>
            </svelte:fragment>
        </CardGrid>
    </Form>
</Container>
