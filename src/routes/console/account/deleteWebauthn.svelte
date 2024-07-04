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
    import { AuthenticatorType } from '@appwrite.io/console';

    export let showWebauthnDelete = false;

    let code: string;
    let error: string;

    async function deleteWebauthnAuthenticator() {
        try {
            await sdk.forConsole.account.deleteMfaAuthenticator(AuthenticatorType.Totp, code);
            await invalidate(Dependencies.ACCOUNT);
            await invalidate(Dependencies.FACTORS);
            showWebauthnDelete = false;
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

    $: if (showWebauthnDelete) {
        code = '';
        error = '';
    }
</script>

<Modal
    title="Delete authentication method"
    bind:show={showWebauthnDelete}
    onSubmit={deleteWebauthnAuthenticator}
    icon="exclamation"
    state="warning"
    bind:error
    headerDivider={false}>
    <p>Please authenticate with your Webauthn Device to continue.</p>
    <FormList>
        <InputDigits autofocus required bind:value={code} autoSubmit={false} />
    </FormList>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showWebauthnDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
