<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { webhook } from './store';

    const projectId = page.params.project;
    let name: string = null;

    onMount(async () => {
        name ??= $webhook.name;
    });

    async function updateName() {
        try {
            await sdk.forConsole.projects.updateWebhook(
                projectId,
                $webhook.$id,
                name,
                $webhook.events,
                $webhook.url,
                $webhook.security,
                true,
                $webhook.httpUser || undefined,
                $webhook.httpPass || undefined
            );
            await invalidate(Dependencies.WEBHOOK);
            addNotification({
                type: 'success',
                message: 'Webhook name has been updated'
            });
            trackEvent(Submit.WebhookUpdateName);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.WebhookUpdateName);
        }
    }
</script>

<Form onSubmit={updateName}>
    <CardGrid>
        <svelte:fragment slot="title">Name</svelte:fragment>
        Choose any name that will help you distinguish between Webhooks.
        <svelte:fragment slot="aside">
            <InputText id="name" label="Name" bind:value={name} required placeholder="Enter name" />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={name === $webhook.name || !name} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
