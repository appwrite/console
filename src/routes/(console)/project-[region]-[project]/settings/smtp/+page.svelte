<script lang="ts">
    import { CardGrid } from '$lib/components';
    import { Button, Form, InputText, InputEmail } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { project } from '../../store';
    import InputPassword from '$lib/elements/forms/inputPassword.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import InputNumber from '$lib/elements/forms/inputNumber.svelte';
    import deepEqual from 'deep-equal';
    import { onMount } from 'svelte';
    import { organization } from '$lib/stores/organization';
    import { type SMTPSecure } from '@appwrite.io/console';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import { upgradeURL } from '$lib/stores/billing';
    import { Link, Selector, Alert } from '@appwrite.io/pink-svelte';
    import { getProjectRoute } from '$lib/helpers/project';

    let enabled = false;
    let senderName: string;
    let senderEmail: string;
    let replyTo: string;
    let host: string;
    let port: number;
    let username: string;
    let password: string;
    let secure: string;

    const options = [
        { value: 'tls', label: 'TLS' },
        { value: 'ssl', label: 'SSL' },
        { value: '', label: 'None' }
    ];

    onMount(() => {
        enabled = $project.smtpEnabled ?? false;
        senderName = $project.smtpSenderName;
        senderEmail = $project.smtpSenderEmail;
        replyTo = $project.smtpReplyTo;
        host = $project.smtpHost;
        port = $project.smtpPort;
        username = $project.smtpUsername;
        password = $project.smtpPassword;
        secure = $project.smtpSecure === 'tls' ? 'tls' : $project.smtpSecure === 'ssl' ? 'ssl' : '';
    });

    async function updateSmtp() {
        try {
            if (!enabled) {
                enabled = false;
                senderName = undefined;
                senderEmail = undefined;
                replyTo = undefined;
                host = undefined;
                port = undefined;
                username = undefined;
                password = undefined;
            }

            await sdk.forConsole.projects.updateSmtp(
                $project.$id,
                enabled,
                senderName ? senderName : undefined,
                senderEmail ? senderEmail : undefined,
                replyTo ? replyTo : undefined,
                host ? host : undefined,
                port ? port : undefined,
                username ? username : undefined,
                password ? password : undefined,
                secure ? (secure as SMTPSecure) : undefined
            );

            invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: 'SMTP server has been ' + (enabled ? 'enabled.' : 'disabled.')
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

    $: isButtonDisabled = deepEqual(
        { enabled, senderName, senderEmail, replyTo, host, port, username, password, secure },
        {
            enabled: $project.smtpEnabled,
            senderName: $project.smtpSenderName,
            senderEmail: $project.smtpSenderEmail,
            replyTo: $project.smtpReplyTo,
            host: $project.smtpHost,
            port: $project.smtpPort,
            username: $project.smtpUsername,
            password: $project.smtpPassword,
            secure: $project.smtpSecure
        }
    );

    $: if (!enabled) {
        senderName = undefined;
        senderEmail = undefined;
        replyTo = undefined;
        host = undefined;
        port = undefined;
        username = undefined;
        password = undefined;
        secure = undefined;
    }
</script>

<Container>
    <Form onSubmit={updateSmtp}>
        <CardGrid>
            <svelte:fragment slot="title">SMTP server</svelte:fragment>
            You can customize the email service by providing your own SMTP server. View your email templates
            <Link.Anchor href={getProjectRoute('/auth/templates')}>here</Link.Anchor>
            <svelte:fragment slot="aside">
                {#if $organization.billingPlan === BillingPlan.FREE}
                    <Alert.Inline
                        status="info"
                        title="Custom SMTP is a Pro plan feature. Upgrade to enable custom SMTP sever.">
                        <svelte:fragment slot="actions">
                            <Button
                                compact
                                href={$upgradeURL}
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
                <Button
                    submit
                    disabled={isButtonDisabled || $organization.billingPlan === BillingPlan.FREE}>
                    Update
                </Button>
            </svelte:fragment>
        </CardGrid>
    </Form>
</Container>
