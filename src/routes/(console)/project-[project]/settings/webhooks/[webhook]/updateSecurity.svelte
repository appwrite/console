<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputPassword, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { webhook } from './store';
    import { Selector, Typography } from '@appwrite.io/pink-svelte';

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
        <svelte:fragment slot="title">Security</svelte:fragment>
        Set an optional basic HTTP authentication username and password to protect your endpoint from
        unauthorized access.
        <svelte:fragment slot="aside">
            <div>
                <Typography.Title size="s">HTTP Authentication</Typography.Title>
                <p class="text">Use to secure your endpoint from untrusted sources.</p>
            </div>
            <InputText label="User" id="user" placeholder="Enter username" bind:value={httpUser} />
            <InputPassword
                label="Password"
                id="password"
                minlength={0}
                placeholder="Enter password"
                bind:value={httpPass} />

            <Selector.Checkbox
                id="security"
                label="Certificate verification (SSL/TLS)"
                bind:checked={security}
                description="Placeholder" />
            <!-- <span class="u-color-text-danger">Warning:</span> Untrusted or self-signed certificates
            may not be secure.
            <a
                href="https://appwrite.io/docs/advanced/self-hosting/tls-certificates"
                target="_blank"
                rel="noopener noreferrer"
                class="link">
                Learn more</a> -->
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
