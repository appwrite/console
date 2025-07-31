<script lang="ts">
    import { states } from './states.js';
    import { InputSelect } from '$lib/elements/forms';
    import type { PaymentMethod } from '@stripe/stripe-js';
    import { Alert, Card, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { CreditCardBrandImage } from '../index.js';

    export let state: string = '';
    export let card: PaymentMethod | null = null;
</script>

<div class="state-picker-container">
    {#if card}
        <Card.Base variant="secondary" padding="s">
            <Layout.Stack direction="row" alignItems="center" gap="s">
                <CreditCardBrandImage brand={card.card?.brand} />
                <span>ending in {card.card?.last4}</span>
            </Layout.Stack>
            <Typography.Text size="s">
                {card.card.country}
                {card.billing_details.address.postal_code}
            </Typography.Text>
        </Card.Base>
    {/if}

    <Alert.Inline status="info" title="State is required for US payment methods">
        <Typography.Text size="s">
            To complete the billing information, select your state so we can apply the correct taxes
            and meet U.S. legal requirements.
        </Typography.Text>
    </Alert.Inline>

    <InputSelect
        bind:value={state}
        label="State"
        placeholder="Select a state"
        id="state-picker"
        options={states.map((state) => ({
            label: state.name,
            value: state.abbreviation,
            id: state.abbreviation.toLowerCase()
        }))} />
</div>

<style>
    .state-picker-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
</style>
