<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';

    export let showDelete = false;
    const functionId = $page.params.function;

    const handleSubmit = async () => {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .functions.delete(functionId);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Function has been deleted`
            });
            await goto(`${base}/project-${$page.params.region}-${$page.params.project}/functions`);
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
    <p data-private>
        Are you sure you want to delete this function and all associated deployments from your
        project?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
