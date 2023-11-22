<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';

    export let showDelete = false;
    let error: string = null;

    async function handleDelete() {
        try {
            await sdk.forConsole.billing.removeBillingAddress($organization.$id);
            await invalidate(Dependencies.ADDRESS);
            await invalidate(Dependencies.ORGANIZATION);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Billing address has been removed from ${$organization.name}`
            });
            trackEvent(Submit.OrganizationBillingAddressDelete);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.OrganizationBillingAddressUpdate);
        }
    }
</script>

<Modal
    bind:show={showDelete}
    onSubmit={handleDelete}
    icon="exclamation"
    state="warning"
    headerDivider={false}
    title="Delete billing address"
    bind:error>
    <p class="text">
        Are you sure you want to delete this billing address from your <b>{$organization?.name}</b>?
    </p>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
