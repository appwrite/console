<script lang="ts">
    import { CardGrid, DropList, Empty, Heading } from '$lib/components';
    import DropListItem from '$lib/components/dropListItem.svelte';

    let showDropdown = false;
</script>

<CardGrid>
    <Heading tag="h2" size="6">Billing Address</Heading>

    <p class="text">
        View or update your billing address. This address will appear on your invoice.
    </p>
    <svelte:fragment slot="aside">
        <DropList bind:show={showDropdown} fullWidth noArrow>
            <Empty on:click={() => (showDropdown = true)}>
                <p class="text">Add a billing address</p>
            </Empty>
            <svelte:fragment slot="list">
                <DropListItem>Add new billing address</DropListItem>
            </svelte:fragment>
        </DropList>
    </svelte:fragment>
</CardGrid>
