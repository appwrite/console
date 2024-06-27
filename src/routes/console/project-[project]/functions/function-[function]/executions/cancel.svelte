<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    //import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    export let showCancel = false;
    export let selectedExecution: Models.Execution = null;

    async function handleSubmit() {
        try {
            // TODO: update SDK to use the new function
            // await sdk.forProject.functions.cancelExecution(selectedExecution.$id);
            await invalidate(Dependencies.FUNCTION);
            showCancel = false;
            addNotification({
                type: 'success',
                message: `Execution has been canceled`
            });
            trackEvent(Submit.ExecutionCancel);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.ExecutionCancel);
        }
    }
</script>

<Modal
    title="Cancel execution"
    bind:show={showCancel}
    onSubmit={handleSubmit}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <p data-private>Are you sure you want to cancel this execution?</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showCancel = false)}>No</Button>
        <Button secondary submit>Yes</Button>
    </svelte:fragment>
</Modal>
