<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { topic } from './store';
    import { project } from '../../../store';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';

    export let showDelete = false;
    let error: string;
    const deleteTopic = async () => {
        try {
            await sdk.forProject.messaging.deleteTopic($topic.$id);

            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$topic.name} has been deleted`
            });
            trackEvent(Submit.MessagingTopicDelete);
            await goto(`${base}/project-${page.params.project}/messaging/topics`);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.MessagingTopicDelete);
        }
    };
</script>

<Confirm onSubmit={deleteTopic} title="Delete topic" bind:open={showDelete} bind:error>
    Are you sure you want to delete <b>{$topic.name}</b> from '{$project.name}'?
</Confirm>
