<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { topic } from './store';
    import { project } from '../../../store';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { getProjectRoute } from '$lib/helpers/project';

    export let showDelete = false;
    let error: string;
    const deleteTopic = async () => {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .messaging.deleteTopic($topic.$id);

            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$topic.name} has been deleted`
            });
            trackEvent(Submit.MessagingTopicDelete);
            await goto(getProjectRoute('/messaging/topics'));
        } catch (e) {
            error = e.message;
            trackError(e, Submit.MessagingTopicDelete);
        }
    };
</script>

<Confirm onSubmit={deleteTopic} title="Delete topic" bind:open={showDelete} bind:error>
    <span>Are you sure you want to delete <b>{$topic.name}</b> from '{$project.name}'?</span>
</Confirm>
