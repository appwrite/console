<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputText } from '$lib/elements/forms';
    import { isNonNullableObject } from '$lib/helpers/type';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { webhook } from './store';

    const projectId = $page.params.project;
    let url: string | null = null;

    onMount(async () => {
        url ??= $webhook.url;
    });

    async function updateUrl() {
        const args = { projectId, url };
        if (!isNonNullableObject(args)) return;
        try {
            await sdkForConsole.projects.updateWebhook(
                args.projectId,
                $webhook.$id,
                $webhook.name,
                $webhook.events,
                args.url,
                $webhook.security,
                $webhook.httpUser,
                $webhook.httpPass
            );
            invalidate(Dependencies.WEBHOOK);
            addNotification({
                type: 'success',
                message: 'Webhook url has been updated'
            });
            trackEvent('submit_webhook_update_url');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }
</script>

<Form on:submit={updateUrl}>
    <CardGrid>
        <Heading tag="h2" size="7">Update Url</Heading>

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
