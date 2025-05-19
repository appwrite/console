<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { organization } from '$lib/stores/organization';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import { tierToPlan } from '$lib/stores/billing';
    import { toLocaleDate } from '$lib/helpers/date';

    export let showCancel = false;

    let error: string = null;

    async function cancelDowngrade() {
        try {
            await sdk.forConsole.billing.cancelDowngrade($organization.$id);
            await invalidate(Dependencies.ORGANIZATION);
            showCancel = false;
            addNotification({
                type: 'success',
                message: `${$organization.name} plan change has been cancelled.`
            });
        } catch (e) {
            error = e.message;
        }
    }
</script>

<Modal title="Cancel plan change" onSubmit={cancelDowngrade} bind:show={showCancel} bind:error>
    <p>
        Your organization is set to change to <strong>
            {tierToPlan($organization?.billingPlanDowngrade as unknown as string).name}</strong>
        plan on <strong> {toLocaleDate($organization.billingNextInvoiceDate)}</strong>. Are you sure
        you want to cancel this change and keep your current plan?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showCancel = false)}>Keep change</Button>
        <Button secondary submit>Cancel change</Button>
    </svelte:fragment>
</Modal>
