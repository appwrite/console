<script lang="ts">
    import { CardGrid, Empty, Heading } from '$lib/components';
    import { addressList } from '$routes/console/organization-[organization]/billing/store';
    import AddressModal from './addressModal.svelte';

    let show = false;

    $: console.log($addressList);
</script>

<CardGrid>
    <Heading tag="h2" size="6">Billing Address</Heading>

    <p class="text">
        View or update your billing address. This address will appear on your invoice.
    </p>
    <svelte:fragment slot="aside">
        <Empty on:click={() => (show = true)}>
            <p class="text">Add a billing address</p>
        </Empty>
    </svelte:fragment>
</CardGrid>

<AddressModal bind:show />
