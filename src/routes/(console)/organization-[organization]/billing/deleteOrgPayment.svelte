<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { organization } from '$lib/stores/organization';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import Confirm from '$lib/components/confirm.svelte';
    import { Typography } from '@appwrite.io/pink-svelte';

    export let showDelete = false;
    export let isBackup = false;
    export let disabled = false;
    export let hasOtherMethod = false;

    let error: string;

    async function removeDefaultMethod() {
        if ($organization?.billingPlan !== BillingPlan.FREE && !hasOtherMethod) return;

        try {
            await sdk.forConsole.billing.removeOrganizationPaymentMethod($organization.$id);
            addNotification({
                type: 'success',
                message: `The payment method has been removed from ${$organization.name}`
            });
            trackEvent(Submit.OrganizationPaymentDelete);
            invalidate(Dependencies.ORGANIZATION);
            showDelete = false;
        } catch (e) {
            error = e.message;
            trackError(e, Submit.OrganizationPaymentDelete);
        } finally {
            showDelete = false;
        }
    }
    async function removeBackuptMethod() {
        if ($organization?.billingPlan !== BillingPlan.FREE && !hasOtherMethod) return;
        showDelete = false;

        try {
            await sdk.forConsole.billing.removeOrganizationPaymentMethodBackup($organization.$id);
            addNotification({
                type: 'success',
                message: `The payment method has been removed from ${$organization.name}`
            });
            trackEvent(Submit.OrganizationBackupPaymentDelete);
            invalidate(Dependencies.ORGANIZATION);
            showDelete = false;
        } catch (e) {
            error = e.message;
            trackError(e, Submit.OrganizationBackupPaymentDelete);
        }
    }
</script>

{#if disabled}
    <Confirm title="Unable to delete payment method" bind:open={showDelete} canDelete={false}>
        <Typography.Text>
            The {isBackup ? 'backup' : 'default'} payment method cannot be removed as
            <b>{$organization?.name}</b>
            has an upcoming invoice. To proceed, set a {isBackup ? 'default' : 'backup'} or add a new
            {isBackup ? 'backup' : 'default'} payment method.
        </Typography.Text>
    </Confirm>
{:else}
    <Confirm
        onSubmit={isBackup ? removeBackuptMethod : removeDefaultMethod}
        title="Remove payment method"
        bind:open={showDelete}
        bind:error>
        <Typography.Text>
            Are you sure you want to remove the payment method from <b>{$organization?.name}</b>?
        </Typography.Text>
    </Confirm>
{/if}
