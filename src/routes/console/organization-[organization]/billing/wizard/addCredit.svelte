<script lang="ts">
    import { Button, FormList, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { addCreditWizardStore } from '../store';

    let couponValid = false;

    async function checkCoupon() {
        try {
            await sdk.forConsole.billing.getCoupon($addCreditWizardStore.coupon);
            couponValid = true;
        } catch (e) {
            couponValid = false;
        }
    }
</script>

<WizardStep>
    <svelte:fragment slot="title">Add credits</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Add Appwrite credits to your organization. A payment method is required before credits can
        be applied.
    </svelte:fragment>
    <FormList>
        <InputText
            placeholder="Promo code"
            id="code"
            label="Add promo code"
            bind:value={$addCreditWizardStore.coupon}>
            <Button secondary on:click={checkCoupon}>Add</Button>
        </InputText>
    </FormList>
</WizardStep>
