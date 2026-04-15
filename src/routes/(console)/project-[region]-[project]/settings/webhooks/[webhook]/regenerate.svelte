<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Modal from '$lib/components/modal.svelte';
    import { Secret } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, InputPassword } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';
    import { get } from 'svelte/store';
    import { webhook as webhookStore } from './store';

    type WebhooksWithCustomSecret = {
        updateSecret(params: { webhookId: string; secret?: string }): Promise<Models.Webhook>;
    };

    export let show = false;

    const projectId = page.params.project;
    let secret = '';
    let revealedSecret = '';

    $: if (!show) {
        secret = '';
        revealedSecret = '';
    }

    async function regenerate() {
        try {
            const currentWebhook = get(webhookStore);
            const customSecret = secret.trim();
            const updatedWebhook = await (
                sdk.forProject(page.params.region, projectId).webhooks as WebhooksWithCustomSecret
            ).updateSecret({
                webhookId: currentWebhook.$id,
                secret: customSecret || undefined
            });
            await invalidate(Dependencies.WEBHOOK);
            revealedSecret = customSecret || updatedWebhook.secret;
            addNotification({
                type: 'success',
                message: customSecret ? 'Key has been updated' : 'Key has been regenerated'
            });
            trackEvent(Submit.WebhookUpdateSignature);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.WebhookUpdateSignature);
        }
    }
</script>

<Modal title="Update Key" bind:show onSubmit={regenerate}>
    <Layout.Stack gap="l">
        {#if revealedSecret}
            <Typography.Text>
                Copy this signature key now. For security reasons, you will not be able to view it
                again after closing this dialog.
            </Typography.Text>
            <Secret label="Key" copyEvent="signature" bind:value={revealedSecret} />
        {:else}
            <Typography.Text>
                Enter a custom signing key, or leave the field empty to generate a new one.
            </Typography.Text>
            <Typography.Text variant="m-400">
                You will not be able to recover the current key after this change.
            </Typography.Text>
            <InputPassword
                id="webhook-secret"
                label="Custom key"
                placeholder="Leave empty to auto-generate"
                minlength={0}
                autocomplete
                bind:value={secret} />
        {/if}
    </Layout.Stack>

    <svelte:fragment slot="footer">
        {#if revealedSecret}
            <Button on:click={() => (show = false)}>Done</Button>
        {:else}
            <Button text on:click={() => (show = false)}>Cancel</Button>
            <Button submit>{secret.trim() ? 'Update key' : 'Regenerate key'}</Button>
        {/if}
    </svelte:fragment>
</Modal>
