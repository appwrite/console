<script lang="ts">
    import { CardGrid, Empty, Heading } from '$lib/components';
</script>

<CardGrid>
    <Heading tag="h2" size="6">Billing Address</Heading>

    <p class="text">
        View or update your billing address. This address will appear on your invoice.
    </p>
    <svelte:fragment slot="aside">
        <Empty>
            <p class="text">Add a billing address</p>
        </Empty>
    </svelte:fragment>
</CardGrid>
