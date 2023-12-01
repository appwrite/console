<script lang="ts">
    import { Button, FormList, InputText } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { addCreditWizardStore } from '../store';
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
            <Button secondary submit>Add</Button>
        </InputText>
    </FormList>
</WizardStep>
