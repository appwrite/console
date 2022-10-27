<script lang="ts">
    import { Modal } from '$lib/components';
    import { InputText, FormList, InputChoice, InputTags } from '$lib/elements/forms';
    import type { Attributes } from '../store';

    export let showOverview = false;
    export let selectedAttribute: Attributes & {
        min: string;
        max: string;
        format: string;
        default: string;
        value: string;
        elements: string[];
    };
</script>

<Modal size="big" bind:show={showOverview}>
    <svelte:fragment slot="header">Overview</svelte:fragment>
    <FormList>
        {#if selectedAttribute}
            <InputText
                id="ID"
                label="Attribute ID"
                placeholder="Enter ID"
                bind:value={selectedAttribute.key}
                disabled />
            <InputText id="type" label="Type" value={selectedAttribute.type ?? ''} readonly />
            {#if selectedAttribute.format}
                <InputText id="format" label="Format" value={selectedAttribute.format} readonly />
            {/if}
            {#if selectedAttribute.min}
                <InputText id="min" label="Min" value={selectedAttribute.min ?? ''} readonly />
            {/if}
            {#if selectedAttribute.max}
                <InputText id="max" label="Max" value={selectedAttribute.max ?? ''} readonly />
            {/if}
            {#if selectedAttribute.elements}
                <InputTags
                    id="elements"
                    label="Elements"
                    tags={selectedAttribute.elements}
                    readonly />
            {/if}
            <InputText
                id="default"
                label="Default value"
                value={selectedAttribute.default}
                readonly />
            <InputChoice id="required" label="Required" value={selectedAttribute.required} disabled>
                Indicate whether this is a required attribute</InputChoice>
            <InputChoice id="array" label="Array" value={selectedAttribute.array} disabled>
                Indicate whether this attribute should act as an array</InputChoice>
        {/if}
    </FormList>
</Modal>
