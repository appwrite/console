<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { AuthenticatorType } from '@appwrite.io/console';

    export let showDelete = false;

    let error: string;

    async function deleteAuthenticator() {
        try {
            await sdk.forConsole.account.deleteMfaAuthenticator(AuthenticatorType.Totp);
            await invalidate(Dependencies.ACCOUNT);
            await invalidate(Dependencies.FACTORS);
            showDelete = false;
            addNotification({
                type: 'success',
                message: 'The authenticator has been removed'
            });
            trackEvent(Submit.AccountAuthenticatorDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.AccountAuthenticatorDelete);
        }
    }

    $: if (showDelete) {
        error = '';
    }
</script>

<Confirm
    onSubmit={deleteAuthenticator}
    title="Delete authentication method"
    bind:open={showDelete}
    bind:error>
    <p>Are you sure you want to delete this authentication method?</p>
    <p>You will no longer be able to use this method to authenticate your account.</p>
</Confirm>
