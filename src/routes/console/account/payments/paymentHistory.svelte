<script lang="ts">
    import { CardGrid, EmptySearch, Heading } from '$lib/components';
</script>

<CardGrid>
    <Heading tag="h2" size="6">Payment History</Heading>

    <p class="text">
        Transaction history for this Organization. Download invoices for more details about your
        payments.
    </p>
    <svelte:fragment slot="aside">
        <EmptySearch cardOnly>
            <p class="text u-text-center">
                You have no payment history. After you receive your first invoice, you'll see it
                here.
            </p>
        </EmptySearch>
    </svelte:fragment>
</CardGrid>
