<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import { Button, Form, FormList, InputText, InputSwitch } from '$lib/elements/forms';
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

    let enabled = false;
    let sender: string;
    let host: string;
    let port: number;
    let username: string;
    let password: string;

    onMount(() => {
        enabled = $project.smtpEnabled ?? false;
        sender = $project.smtpSender;
        host = $project.smtpHost;
        port = $project.smtpPort;
        username = $project.smtpUsername;
    });

    async function updateSmtp() {
        const path = '/projects/' + $project.$id + '/smtp';

        const params = {
            enabled,
            sender,
            host,
            port,
            username,
            password: password ? password : $project.smtpPassword
        };
        try {
            await sdk.forConsole.client.call(
                'PATCH',
                new URL(sdk.forConsole.client.config.endpoint + path),
                { 'content-type': 'application/json' },
                params
            );

            invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: 'SMTP server has been ' + (enabled ? 'enabled.' : 'disabled.')
            });
            trackEvent(Submit.projectUpdateSMTP);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.projectUpdateSMTP);
        }
    }
</script>

<Container>
    <Form onSubmit={updateSmtp}>
        <CardGrid>
            <Heading tag="h6" size="7">SMTP Server</Heading>
            <p class="text">
                You can customize the email service by providing your own SMTP server. View your
                email templates <a
                    href="{base}/console/project-{$project.$id}/auth/templates"
                    class="link">here</a>
            </p>
            <svelte:fragment slot="aside">
                <FormList>
                    <InputSwitch id="enabled" bind:value={enabled} label="Custom SMTP Server" />
                    <p class="text">
                        Enabling this option allows customizing email templates and prevents emails
                        from being labeled as spam.
                    </p>

                    {#if enabled}
                        <InputText
                            id="senderEmail"
                            label="Sender Email"
                            bind:value={sender}
                            required
                            placeholder="user@example.io" />
                        <InputText
                            id="serverHost"
                            label="Server Host"
                            bind:value={host}
                            required
                            placeholder="smtp.sendgrid.net" />
                        <InputNumber
                            id="serverPort"
                            label="Server Port"
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
                            id="passwort"
                            label="Password"
                            bind:value={password}
                            required
                            placeholder="Enter password" />
                    {/if}
                </FormList>
            </svelte:fragment>
            <svelte:fragment slot="actions">
                <Button text disabled={!enabled}>Send test email</Button>
                <Button submit>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>
</Container>
