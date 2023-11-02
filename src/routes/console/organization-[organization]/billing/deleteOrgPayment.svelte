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
    export let disabled = false;

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
            trackEvent(Submit.OrganizationPaymentDelete);
            invalidate(Dependencies.ORGANIZATION);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.OrganizationPaymentDelete);
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
            trackEvent(Submit.OrganizationBackupPaymentDelete);
            invalidate(Dependencies.ORGANIZATION);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.OrganizationBackupPaymentDelete);
        }
    }
</script>

{#if disabled}
    <Modal
        bind:show={showDelete}
        icon="exclamation"
        state="warning"
        headerDivider={false}
        title="Unable to delete payment method">
        <p data-private>
            The {isBackup ? 'backup' : 'default'} payment method cannot be deleted as
            <b>{$organization?.name}</b>
            has an upcoming invoice. To proceed with deletion, set a {isBackup
                ? 'default'
                : 'backup'} or add a new {isBackup ? 'backup' : 'default'} payment method.
        </p>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showDelete = false)}>Cancel</Button>
            <Button secondary submit>Delete</Button>
        </svelte:fragment>
    </Modal>
{:else}
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
{/if}
