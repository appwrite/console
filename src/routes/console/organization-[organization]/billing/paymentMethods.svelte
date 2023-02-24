<script lang="ts">
    import { CardGrid, Empty, Heading } from '$lib/components';
    import { paymentMethods } from './store';
    export let showPayment = false;
</script>

<CardGrid>
    <Heading tag="h2" size="6">Payment Methods</Heading>

    <p class="text">View or update your organization payment methods here.</p>
    <svelte:fragment slot="aside">
        {#if $paymentMethods.length > 0}
            {#each $paymentMethods.paymentMethods as paymentMethod}
                <p>
                    {paymentMethod.brand}
                    {paymentMethod.last4}, expiring: {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
                    {#if paymentMethod.default} <span class="icon-check-circle" /> {/if}
                </p>
            {/each}
        {:else}
            <Empty on:click={() => (showPayment = true)}>
                <p class="text">Add a payment method</p>
            </Empty>
        {/if}
    </svelte:fragment>
</CardGrid>
