<script lang="ts">
    import { CardGrid, Empty, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { paymentMethods } from './store';
    export let showPayment = false;

    console.log($paymentMethods);
</script>

<CardGrid>
    <Heading tag="h2" size="6">Payment Methods</Heading>

    <p class="text">View or update your organization payment methods here.</p>
    <svelte:fragment slot="aside">
        {#if $paymentMethods.total > 0}
            {#each $paymentMethods.paymentMethods as paymentMethod}
                <p>
                    {paymentMethod.brand}
                    {paymentMethod.last4}, expiring: {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
                    {#if paymentMethod.default} <span class="icon-check-circle" /> {/if}
                </p>
            {/each}
            <Button text noMargin on:click={() => (showPayment = true)}>
                <span class="icon-plus" />
                <span class="text">Add a payment method</span>
            </Button>
        {:else}
            <Empty on:click={() => (showPayment = true)}>
                <p class="text">Add a payment method</p>
            </Empty>
        {/if}
    </svelte:fragment>
</CardGrid>
