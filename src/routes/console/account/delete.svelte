<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import LL from '$i18n/i18n-svelte';

    export let showDelete = false;

    async function deleteAccount() {
        try {
            await sdk.forConsole.account.updateStatus();
            await invalidate(Dependencies.ACCOUNT);
            showDelete = false;
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
    }
</script>

<Modal
    bind:show={showDelete}
    onSubmit={deleteAccount}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <svelte:fragment slot="header">{$LL.console.account.title.deleteAccount()}</svelte:fragment>
    <p>{$LL.console.account.texts.deleteWarning()}</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}
            >{$LL.console.account.button.submit.cancel()}</Button>
        <Button secondary submit>{$LL.console.account.button.submit.delete()}</Button>
    </svelte:fragment>
</Modal>
