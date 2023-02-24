<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';

    export let showDelete = false;
    const sourceId = $page.params.source;

    const handleSubmit = async () => {
        try {
            await sdkForProject.transfers.deleteSource(sourceId);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Source has been deleted`
            });
            await goto(
                `${base}/console/project-${$page.params.project}/settings/transfers/sources`
            );
            trackEvent(Submit.SourceDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.SourceDelete);
        }
    };
</script>

<Modal bind:show={showDelete} on:submit={handleSubmit} warning>
    <svelte:fragment slot="header">Delete Source</svelte:fragment>
    <p>Are you sure you want to delete this Source from your project?</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
