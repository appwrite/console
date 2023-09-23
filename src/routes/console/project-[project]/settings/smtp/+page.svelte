<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import {
        Button,
        Form,
        FormList,
        InputText,
        InputChoice,
        InputEmail
    } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { project } from '../../store';
    import { onMount } from 'svelte/internal';
    import InputPassword from '$lib/elements/forms/inputPassword.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import InputNumber from '$lib/elements/forms/inputNumber.svelte';
    import { base } from '$app/paths';
    import deepEqual from 'deep-equal';

    let enabled = false;
    let senderName: string;
    let senderEmail: string;
    let replyTo: string;
    let host: string;
    let port: number;
    let username: string;
    let password: string;
    let secure = false;

    onMount(() => {
        enabled = $project.smtpEnabled ?? false;
        senderName = $project.smtpSenderName;
        senderEmail = $project.smtpSenderEmail;
        replyTo = $project.smtpReplyTo;
        host = $project.smtpHost;
        port = $project.smtpPort;
        username = $project.smtpUsername;
        password = $project.smtpPassword;
        secure = $project.smtpSecure === 'tls';
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
            await sdk.forConsole.projects.updateSmtpConfiguration(
                $project.$id,
                enabled,
                senderName ? senderName : undefined,
                senderEmail ? senderEmail : undefined,
                replyTo ? replyTo : undefined,
                host ? host : undefined,
                port ? port : undefined,
                username ? username : undefined,
                password ? password : undefined,
                secure ? 'tls' : undefined
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
            secure: $project.smtpSecure === 'tls'
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
        secure = false;
    }
</script>

<Container>
    <Form onSubmit={updateSmtp}>
        <CardGrid>
            <Heading tag="h6" size="7">SMTP server</Heading>
            <p class="text">
                You can customize the email service by providing your own SMTP server. View your
                email templates <a
                    href="{base}/console/project-{$project.$id}/auth/templates"
                    class="link">here</a>
            </p>
            <svelte:fragment slot="aside">
                <FormList>
                    <InputChoice
                        type="switchbox"
                        id="enabled"
                        bind:value={enabled}
                        label="Custom SMTP server">
                        Enabling this option allows customizing email templates and prevents emails
                        from being labeled as spam.
                    </InputChoice>

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
                            required
                            placeholder="Enter username" />
                        <InputPassword
                            showPasswordButton
                            id="passwort"
                            label="Password"
                            bind:value={password}
                            required
                            placeholder="Enter password" />

                        <InputChoice bind:value={secure} id="tls" label="TLS secure protocol">
                            Enable if TLS is supported on your SMTP server.
                        </InputChoice>
                    {/if}
                </FormList>
            </svelte:fragment>
            <svelte:fragment slot="actions">
                <Button submit disabled={isButtonDisabled}>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>
</Container>
