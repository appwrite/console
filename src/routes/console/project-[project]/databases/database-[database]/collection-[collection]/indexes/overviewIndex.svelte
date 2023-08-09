<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button, InputText, FormList } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';

    export let showOverview = false;
    export let selectedIndex: Models.Index = null;
    //TODO: add error message when index failed
</script>

<Modal size="big" bind:show={showOverview}>
    <svelte:fragment slot="title">Overview</svelte:fragment>
    <FormList>
        <InputText
            id="key"
            label="Index Key"
            placeholder="Enter Key"
            value={selectedIndex.key}
            readonly />
        <InputText
            id="type"
            label="Index type"
            placeholder="Select type"
            value={selectedIndex.type}
            readonly />

        {#if selectedIndex?.attributes?.length}
            {#each selectedIndex.attributes as attribute, i}
                <li class="form-item is-multiple">
                    <div class="form-item-part u-stretch">
                        <label class="label" for={`value-${attribute}`}>Attribute</label>
                        <div class="input-text-wrapper">
                            <input
                                id={`value-${attribute}`}
                                placeholder=""
                                type="text"
                                class="input-text"
                                value={attribute}
                                readonly />
                        </div>
                    </div>
                    <div class="form-item-part u-stretch">
                        <label class="label" for={`value-${selectedIndex.orders[i]}`}>Order</label>
                        <div class="input-text-wrapper">
                            <input
                                id={`value-${selectedIndex.orders[i]}`}
                                placeholder=""
                                type="text"
                                class="input-text"
                                value={selectedIndex.orders[i]}
                                readonly />
                        </div>
                    </div>
                    <div class="form-item-part u-cross-child-end">
                        <Button text disabled>
                            <span class="icon-x" aria-hidden="true" />
                        </Button>
                    </div>
                </li>
            {/each}
        {/if}
    </FormList>
</Modal>
