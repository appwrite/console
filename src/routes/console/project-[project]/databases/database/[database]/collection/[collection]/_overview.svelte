<script lang="ts">
    import { Modal } from '$lib/components';
    import { option, options } from './attributes/store';
    import { InputText, FormList } from '$lib/elements/forms';
    import type { Attributes } from './store';

    export let showOverview = false;
    export let selectedAttribute: Attributes;

    $: if (selectedAttribute) {
        $option = options.find(
            (option) => option.name.toLocaleLowerCase() === selectedAttribute.type
        );
    }
</script>

{#if selectedAttribute}
    <Modal size="big" bind:show={showOverview}>
        <svelte:fragment slot="header">Overview</svelte:fragment>
        <FormList>
            <InputText
                id="ID"
                label="Attribute ID"
                placeholder="Enter ID"
                bind:value={selectedAttribute.key}
                disabled />

            {#if selectedAttribute}
                <svelte:component this={$option.component} overview={true} {selectedAttribute} />
            {/if}
        </FormList>
    </Modal>
{/if}
