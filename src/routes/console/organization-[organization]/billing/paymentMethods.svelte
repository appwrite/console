<script lang="ts">
    import { CardGrid, Empty, Heading } from '$lib/components';
</script>

<CardGrid>
    <Heading tag="h2" size="6">Payment Methods</Heading>

    <p class="text">View or update your organization payment methods here.</p>
    <svelte:fragment slot="aside">
        <Empty>
            <p class="text">Add a payment method</p>
        </Empty>
    </svelte:fragment>
</CardGrid>
