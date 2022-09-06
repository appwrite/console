<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';

    export let showDelete = false;

    const deleteAccount = async () => {
        try {
            await sdkForConsole.users.delete($user.$id);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Account was deleted `
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    };
</script>

<Form on:submit={deleteAccount}>
    <Modal bind:show={showDelete} warning>
        <svelte:fragment slot="header">Delete Account</svelte:fragment>
        <p>Are you sure you want to delete your account?</p>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showDelete = false)}>Cancel</Button>
            <Button secondary submit>Delete</Button>
        </svelte:fragment>
    </Modal>
</Form>
