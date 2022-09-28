<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';

    export let showDelete = false;
    const functionId = $page.params.function;

    const handleSubmit = async () => {
        try {
            await sdkForProject.functions.delete(functionId);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Function has been deleted`
            });
            await goto(`${base}/console/project-${$page.params.project}/functions`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Form single on:submit={handleSubmit}>
    <Modal bind:show={showDelete} warning>
        <svelte:fragment slot="header">Delete Function</svelte:fragment>
        <p>
            Are you sure you want to delete this function and all associated deployments from your
            project?
        </p>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showDelete = false)}>Cancel</Button>
            <Button secondary submit>Delete</Button>
        </svelte:fragment>
    </Modal>
</Form>
