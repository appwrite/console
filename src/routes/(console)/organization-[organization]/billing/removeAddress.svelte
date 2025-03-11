<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';

    export let show = false;

    let error: string;

    async function removeAddress() {
        try {
            await sdk.forConsole.organizations.deleteBillingAddress($organization.$id);
            addNotification({
                type: 'success',
                message: `The billing address has been removed from ${$organization.name}`
            });
            trackEvent(Submit.OrganizationBillingAddressDelete);
            invalidate(Dependencies.ORGANIZATION);
            show = false;
        } catch (e) {
            error = e.message;
            trackError(e, Submit.OrganizationBillingAddressDelete);
        }
    }
</script>

<Modal
    bind:show
    bind:error
    onSubmit={removeAddress}
    icon="exclamation"
    state="warning"
    headerDivider={false}
    title="Remove billing address">
    <p data-private>
        Are you sure you want to remove the billing address from <b>{$organization?.name}</b>?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit>Remove</Button>
    </svelte:fragment>
</Modal>
