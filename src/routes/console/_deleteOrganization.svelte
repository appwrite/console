<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { Modal } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { organization } from './store';

    export let showDelete = false;

    const deleteUser = async () => {
        try {
            await sdkForConsole.teams.delete($organization.$id);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$organization.name} has been deleted`
            });
            await goto(`${base}/console/`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Form on:submit={deleteUser}>
    <Modal bind:show={showDelete} warning>
        <svelte:fragment slot="header">Delete Organization</svelte:fragment>
        <p>
            Are you sure you want to delete <b>{$organization.name}</b>? All projects ({$organization.total})
            and data associated with this organization will be deleted. This action is irreversible.
        </p>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showDelete = false)}>Cancel</Button>
            <Button secondary submit>Delete</Button>
        </svelte:fragment>
    </Modal>
</Form>
