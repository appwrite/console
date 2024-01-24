<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import {
        Button,
        Form,
        FormList,
        InputChoice,
        InputPassword,
        InputText
    } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { webhook } from './store';

    const projectId = $page.params.project;
    let httpUser: string = null;
    let httpPass: string = null;
    let security = false;

    onMount(async () => {
        httpUser ??= $webhook.httpUser;
        httpPass ??= $webhook.httpPass;
        security = $webhook.security;
    });

    async function updateSecurity() {
        try {
            await sdk.forConsole.projects.updateWebhook(
                projectId,
                $webhook.$id,
                $webhook.name,
                $webhook.events,
                $webhook.url,
                security,
                true,
                httpUser || undefined,
                httpPass || undefined
            );
            await invalidate(Dependencies.WEBHOOK);
            addNotification({
                type: 'success',
                message: 'Webhook security has been updated'
            });
            trackEvent(Submit.WebhookUpdateSecurity);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.WebhookUpdateSecurity);
        }
    }
</script>

<Form onSubmit={updateSecurity}>
    <CardGrid>
        <Heading tag="h2" size="7">Security</Heading>
        <p class="text">
            Set an optional basic HTTP authentication username and password to protect your endpoint
            from unauthorized access.
        </p>
        <svelte:fragment slot="aside">
            <FormList>
                <div>
                    <Heading tag="h3" size="7">HTTP Authentication</Heading>
                    <p class="text">Use to secure your endpoint from untrusted sources.</p>
                </div>
                <InputText
                    label="User"
                    id="user"
                    placeholder="Enter username"
                    bind:value={httpUser} />
                <InputPassword
                    label="Password"
                    id="password"
                    minlength={0}
                    showPasswordButton
                    placeholder="Enter password"
                    bind:value={httpPass} />

                <InputChoice
                    id="Security"
                    label="Certificate verification (SSL/TLS)"
                    bind:value={security}>
                    <span class="u-color-text-danger">Warning:</span> Untrusted or self-signed
                    certificates may not be secure.
                    <a
                        href="https://appwrite.io/docs/advanced/self-hosting/tls-certificates"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="link">
                        Learn more</a>
                </InputChoice>
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                disabled={httpUser === $webhook.httpUser &&
                    httpPass === $webhook.httpPass &&
                    security === $webhook.security}
                submit>
                Update
            </Button>
        </svelte:fragment>
    </CardGrid>
</Form>
