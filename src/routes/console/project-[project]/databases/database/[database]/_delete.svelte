<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Modal } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { database } from './store';

    export let showDelete = false;

    const deleteElement = async () => {
        try {
            await sdkForProject.databases.delete();
            showDelete = false;
            await goto(`${base}/console/project-${$page.params.project}/databases`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Form on:submit={deleteElement}>
    <Modal warning={true} bind:show={showDelete}>
        <svelte:fragment slot="header">Delete Database</svelte:fragment>

        <p>
            Are you sure you want to delete <b>{$database.name}</b>?
        </p>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showDelete = false)}>Cancel</Button>
            <Button secondary submit>Delete</Button>
        </svelte:fragment>
    </Modal>
</Form>
