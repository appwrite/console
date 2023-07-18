<script lang="ts">
    import { CardGrid, DropList, Heading } from '$lib/components';
    import DropListItem from '$lib/components/dropListItem.svelte';
    import { Button } from '$lib/elements/forms';

    let showDropdown = false;
</script>

<CardGrid>
    <Heading tag="h2" size="6">Billing Address</Heading>

    <p class="text">
        View or update your billing address. This address will appear on your invoice.
    </p>
    <svelte:fragment slot="aside">
        <article class="card u-grid u-cross-center u-width-full-line dashed">
            <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
                <div class="common-section">
                    <DropList bind:show={showDropdown} placement="bottom-end">
                        <Button secondary round on:click={() => (showDropdown = !showDropdown)}>
                            <i class="icon-plus" />
                        </Button>
                        <svelte:fragment slot="list">
                            <!-- {#if $addressList.total}
                                {#each $addressList.addresses as address}
                                    <DropListItem
                                        on:click={() => addAddress(address?.$id)}>
                                        <p class="text">
                                            {address.address1}
                                            <span>{address.city}</span>
                                        </p>
                                    </DropListItem>
                                {/each}
                            {/if} -->
                            <DropListItem>Add new billing address</DropListItem>
                        </svelte:fragment>
                    </DropList>
                </div>
                <div class="common-section">
                    <span class="text"> Add a billing address</span>
                </div>
            </div>
        </article>
    </svelte:fragment>
</CardGrid>
