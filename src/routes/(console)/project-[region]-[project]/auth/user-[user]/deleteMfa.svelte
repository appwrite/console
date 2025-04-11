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
    import { page } from '$app/stores';

    export let showDelete = false;

    let error: string;

    async function deleteProvider() {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .users.deleteMfaAuthenticator($user.$id, AuthenticatorType.Totp);
            await invalidate(Dependencies.USER);
            showDelete = false;
            addNotification({
                type: 'success',
                message: 'The authenticator has been removed'
            });
            trackEvent(Submit.UserAuthenticatorDelete);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.UserAuthenticatorDelete);
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
    <p>Are you sure you want to delete this authentication?</p>
    <p class="text u-bold">This action is irreversible.</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
