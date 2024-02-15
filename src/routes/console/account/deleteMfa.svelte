<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import FormList from '$lib/elements/forms/formList.svelte';
    import InputDigits from '$lib/elements/forms/inputDigits.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { AuthenticatorProvider } from '@appwrite.io/console';

    export let showDelete = false;

    let code: string;
    let error: string;

    async function deleteProvider() {
        try {
            await sdk.forConsole.account.deleteAuthenticator(AuthenticatorProvider.Totp, code);
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
        code = '';
        error = '';
    }
</script>

<Modal
    title="Delete authentication provider"
    bind:show={showDelete}
    onSubmit={deleteProvider}
    icon="exclamation"
    state="warning"
    bind:error
    headerDivider={false}>
    <p>Are you sure you want to delete this authentication method from your account?</p>
    <FormList>
        <InputDigits autofocus required bind:value={code} />
    </FormList>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
