<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { organization } from '$lib/stores/organization';
    import { Dependencies } from '$lib/constants';

    export let showDelete = false;
    export let isBackup = false;

    let error: string;

    async function removeDefaultMethod() {
        if (!$organization.paymentMethodId || !$organization.backupPaymentMethodId) return;
        showDelete = false;

        try {
            await sdk.forConsole.billing.removeOrganizationPaymentMethod($organization.$id);
            addNotification({
                type: 'success',
                message: `The payment method has been removed from ${$organization.name}`
            });
            trackEvent(Submit.OrganizationPaymentRemove);
            invalidate(Dependencies.ORGANIZATION);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.OrganizationPaymentRemove);
        }
    }
    async function removeBackuptMethod() {
        if (!$organization.paymentMethodId || !$organization.backupPaymentMethodId) return;
        showDelete = false;

        try {
            await sdk.forConsole.billing.removeOrganizationPaymentMethodBackup($organization.$id);
            addNotification({
                type: 'success',
                message: `The payment method has been removed from ${$organization.name}`
            });
            trackEvent(Submit.OrganizationBackupPaymentRemove);
            invalidate(Dependencies.ORGANIZATION);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.OrganizationBackupPaymentRemove);
        }
    }
</script>

<Modal
    bind:show={showDelete}
    bind:error
    onSubmit={isBackup ? removeBackuptMethod : removeDefaultMethod}
    icon="exclamation"
    state="warning"
    headerDivider={false}
    title="Delete payment method">
    <p data-private>
        Are you sure you want to delete the payment method from <b>{$organization?.name}</b>?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal>
