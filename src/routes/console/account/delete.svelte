<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';

    export let showDelete = false;

    const deleteAccount = async () => {
        try {
            await sdkForConsole.account.updateStatus();
            showDelete = false;
            invalidate(Dependencies.ACCOUNT);
            addNotification({
                type: 'success',
                message: `Account was deleted `
            });
            trackEvent(Submit.AccountDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AccountDelete);
        }
    };
</script>

<Modal bind:show={showDelete} onSubmit={deleteAccount} warning>
    <svelte:fragment slot="header">Delete Account</svelte:fragment>
    <p>Are you sure you want to delete your account?</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
