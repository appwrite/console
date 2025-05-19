<script lang="ts">
    import { page } from '$app/state';
    import { Button } from '$lib/elements/forms';
    import { HeaderAlert } from '$lib/layout';
    import { hideBillingHeaderRoutes, paymentMissingMandate } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { confirmSetup } from '$lib/stores/stripe';

    async function verifyPaymentMethod() {
        const method = await sdk.forConsole.account.updatePaymentMethodMandateOptions(
            $paymentMissingMandate.$id
        );
        await confirmSetup(method.clientSecret, method.$id);
    }
</script>

{#if $paymentMissingMandate && $paymentMissingMandate?.country?.toLowerCase() === 'in' && $paymentMissingMandate.mandateId === null && !hideBillingHeaderRoutes.includes(page.url.pathname)}
    <HeaderAlert title="Authorization required" type="info">
        The payment method for {$organization.name} needs to be verified.
        <svelte:fragment slot="buttons">
            <Button secondary on:click={verifyPaymentMethod}>Verify payment method</Button>
        </svelte:fragment>
    </HeaderAlert>
{/if}
