<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { AuthenticatorType } from '@appwrite.io/console';
    import { user } from './store';

    export let showDelete = false;

    let error: string;

    async function deleteProvider() {
        try {
            await sdk.forConsole.users.deleteAuthenticator($user.$id, AuthenticatorType.Totp, '');
            await invalidate(Dependencies.ACCOUNT);
            await invalidate(Dependencies.FACTORS);
            showDelete = false;
            addNotification({
                type: 'success',
                message: 'The authenticator has been removed'
            });
            trackEvent(Submit.AccountDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.AccountDelete);
        }
    }

    $: if (showDelete) {
        error = '';
    }
</script>

<Modal
    title="Delete authentication method"
    bind:show={showDelete}
    onSubmit={deleteProvider}
    icon="exclamation"
    state="warning"
    bind:error
    headerDivider={false}>
    <p class="u-bold">
        Deleting the authentication method will disable multi-factor authentication for this
        account. To re-enable it, user will need to add a new authentication method.
    </p>
    <p>Are you sure you want to delete this authentication method from your account?</p>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
