<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { webhook } from './store';

    const projectId = $page.params.project;
    let url: string = null;

    onMount(async () => {
        url ??= $webhook.url;
    });

    async function updateUrl() {
        try {
            await sdk.forConsole.projects.updateWebhook(
                projectId,
                $webhook.$id,
                $webhook.name,
                $webhook.events,
                url,
                $webhook.security,
                true,
                $webhook.httpUser || undefined,
                $webhook.httpPass || undefined
            );
            await invalidate(Dependencies.WEBHOOK);
            addNotification({
                type: 'success',
                message: 'Webhook url has been updated'
            });
            trackEvent(Submit.WebhookUpdateUrl);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.WebhookUpdateUrl);
        }
    }
</script>

<Form onSubmit={updateUrl}>
    <CardGrid>
        <Heading tag="h2" size="7">URL</Heading>

        <svelte:fragment slot="aside">
            <FormList>
                <InputText
                    id="url"
                    label="POST URL"
                    bind:value={url}
                    required
                    placeholder="https://example.com/callback" />
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={url === $webhook.url || !url} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
