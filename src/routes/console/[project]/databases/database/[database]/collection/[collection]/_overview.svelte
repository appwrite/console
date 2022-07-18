<script lang="ts">
    import { Modal } from '$lib/components';
    import { option, options } from './attributes/store';
    import { Button, InputText, FormList } from '$lib/elements/forms';
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
                <svelte:component this={$option.component} disabled={true} />
            {/if}
        </FormList>
        <svelte:fragment slot="footer">
            <Button secondary on:click={() => (showOverview = false)}>Cancel</Button>
            <Button submit>Create</Button>
        </svelte:fragment>
    </Modal>
{/if}
