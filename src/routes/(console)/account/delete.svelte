<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';

    export let showDelete = false;
    let error: string;

    async function deleteAccount() {
        try {
            await sdk.forConsole.account.delete();
            await invalidate(Dependencies.ACCOUNT);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Account was deleted `
            });
            trackEvent(Submit.AccountDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.AccountDelete);
        }
    }
</script>

<Modal title="Delete account" bind:show={showDelete} bind:error onSubmit={deleteAccount}>
    <p>Are you sure you want to delete your account?</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
