<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button, InputCheckbox } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { FormList } from '$lib/elements/forms/index.js';

    export let showDelete = false;
    const functionId = $page.params.function;

    let confirmedDeletion = false;

    const handleSubmit = async () => {
        try {
            await sdk.forProject.functions.delete(functionId);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Function has been deleted`
            });
            await goto(`${base}/project-${$page.params.project}/functions`);
            trackEvent(Submit.FunctionDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.FunctionDelete);
        }
    };
</script>

<Modal
    title="Delete function"
    bind:show={showDelete}
    onSubmit={handleSubmit}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <FormList>
        <p data-private>
            Are you sure you want to delete this function and all associated deployments from your
            project?
        </p>

        <div class="input-check-box-friction">
            <InputCheckbox
                required
                size="s"
                id="delete_policy"
                bind:checked={confirmedDeletion}
                label="I understand and confirm" />
        </div>
    </FormList>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit disabled={!confirmedDeletion}>Delete</Button>
    </svelte:fragment>
</Modal>
