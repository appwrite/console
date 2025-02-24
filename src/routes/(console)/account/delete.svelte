<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import Confirm from '$lib/components/confirm.svelte';
    import { Dependencies } from '$lib/constants';
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

<Confirm title="Delete account" onSubmit={deleteAccount} bind:open={showDelete} bind:error>
    Are you sure you want to delete your account?
</Confirm>
