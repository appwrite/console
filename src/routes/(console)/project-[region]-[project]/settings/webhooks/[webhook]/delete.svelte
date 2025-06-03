<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { project } from '../../../store';
    import { webhook } from './store';

    export let showDelete = false;
    let error: string;
    async function handleDelete() {
        try {
            await sdk.forConsole.projects.deleteWebhook($project.$id, $webhook.$id);
            await invalidate(Dependencies.WEBHOOKS);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$webhook.name} has been deleted`
            });
            trackEvent(Submit.WebhookDelete);
            await goto(`${base}/project-${$project.region}-${$project.$id}/settings/webhooks`);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.WebhookDelete);
        }
    }
</script>

<Confirm onSubmit={handleDelete} title="Delete webhook" bind:open={showDelete} bind:error>
    <Typography.Text>
        Are you sure you want to delete <b>{$webhook.name}</b> from '{$project.name}'?
    </Typography.Text>
</Confirm>
