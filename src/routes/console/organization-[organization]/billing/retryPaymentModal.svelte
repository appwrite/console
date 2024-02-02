<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { FakeModal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Dependencies } from '$lib/constants';
    import type { Invoice } from '$lib/sdk/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { page } from '$app/stores';
    import { VARS } from '$lib/system';
    import { confirmPayment } from '$lib/stores/stripe';
    import { organization } from '$lib/stores/organization';
    import { toLocaleDate } from '$lib/helpers/date';

    const endpoint = VARS.APPWRITE_ENDPOINT ?? `${$page.url.origin}/v1`;
    export let show = false;
    export let invoice: Invoice;
    let error: string = null;
    let isButtonDisabled = false;

    async function handleSubmit() {
        isButtonDisabled = true;
        try {
            await confirmPayment(
                $organization.$id,
                invoice.clientSecret,
                $organization.paymentMethodId
            );
            invalidate(Dependencies.ORGANIZATION);
            invalidate(Dependencies.INVOICES);

            trackEvent(Submit.RetryPayment);
            addNotification({
                type: 'success',
                message: `Payment has been successfully processed`
            });
            show = false;
        } catch (e) {
            error = e.message;
            trackError(e, Submit.RetryPayment);
        } finally {
            isButtonDisabled = false;
        }
    }

    $: if (!show) {
        invoice = null;
    }
</script>

<FakeModal
    bind:show
    bind:error
    state="warning"
    onSubmit={handleSubmit}
    size="big"
    headerDivider={false}
    title="Retry payment">
    <!-- TODO: format currency -->
    <p class="text">
        Your payment of <span class="inline-tag">${invoice.amount}</span> due on {toLocaleDate(
            invoice.dueAt
        )} has failed. Retry your payment to avoid service interruptions with your projects.
    </p>

    <Button
        external
        link
        href={`${endpoint}/organizations/${$page.params.organization}/invoices/${invoice.$id}/view`}>
        View invoice
    </Button>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit disabled={isButtonDisabled}>Retry</Button>
    </svelte:fragment>
</FakeModal>
