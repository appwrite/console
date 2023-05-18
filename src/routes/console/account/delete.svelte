<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, FormList, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { user } from '$lib/stores/user';

    export let showDelete = false;
    let email: string = null;

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

<Modal bind:show={showDelete} on:submit={deleteAccount} warning>
    <svelte:fragment slot="header">Deactivate Account</svelte:fragment>
    <p>
        Are you sure you want to deactivate your account? <b
            >This action is irreversible, and you cannot create a new account again with this email.</b>
    </p>
    <FormList>
        <InputText
            label={`Enter "${$user.email}" to continue`}
            placeholder="Enter email"
            id="user-email"
            autofocus
            required
            bind:value={email} />
    </FormList>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button disabled={!email || email !== $user.email} secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
