<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';

    export let showDelete = false;
    export let selectedDeployment: Models.Deployment = null;
    export let functionId: string;

    const handleSubmit = async () => {
        try {
            await sdkForProject.functions.deleteDeployment(functionId, selectedDeployment.$id);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Deployment has been deleted`
            });
            await goto(`${base}/console/project-${$page.params.project}/functions/${functionId}`);
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
        <svelte:fragment slot="header">Delete Deployment</svelte:fragment>
        <p>Are you sure you want to delete this deployment?</p>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showDelete = false)}>Cancel</Button>
            <Button secondary submit>Delete</Button>
        </svelte:fragment>
    </Modal>
</Form>
