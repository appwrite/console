<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/stores';
    import { func } from '../store';
    import type { Models } from '@appwrite.io/console';

    export let showDelete = false;
    export let selectedExecution: Models.Execution;

    async function handleSubmit() {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .functions.deleteExecution($func.$id, selectedExecution.$id);
            await invalidate(Dependencies.EXECUTIONS);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Execution has been deleted`
            });
            trackEvent(Submit.ExecutionDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.ExecutionDelete);
        }
    }
</script>

<Modal
    title="Delete execution"
    bind:show={showDelete}
    onSubmit={handleSubmit}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <p data-private>Are you sure you want to delete this execution?</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
