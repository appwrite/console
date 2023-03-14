<script lang="ts">
    import { Modal } from '$lib/components';
    import { InputText, FormList, InputChoice, InputTags } from '$lib/elements/forms';
    import type { Attributes } from '../store';

    export let showOverview = false;
    export let selectedAttribute: Attributes;

    $: attr = selectedAttribute as {
        type?: string;
        size?: string;
        format?: string;
        array?: boolean;
        required?: boolean;
        status?: string;
        key?: string;
        min?: string;
        max?: string;
        default: string;
        elements?: string[];
    };
</script>

<Modal size="big" bind:show={showOverview}>
    <svelte:fragment slot="header">Overview</svelte:fragment>
    <FormList>
        {#if attr}
            <InputText
                id="ID"
                label="Attribute ID"
                placeholder="Enter ID"
                bind:value={attr.key}
                disabled />
            <InputText id="type" label="Type" value={attr.type ?? ''} readonly />
            {#if attr.size}
                <InputText id="size" label="Size" value={attr.size} readonly />
            {/if}
            {#if attr.format}
                <InputText id="format" label="Format" value={attr.format} readonly />
            {/if}
            {#if attr.min}
                <InputText id="min" label="Min" value={attr.min ?? ''} readonly />
            {/if}
            {#if attr.max}
                <InputText id="max" label="Max" value={attr.max ?? ''} readonly />
            {/if}
            {#if attr.elements}
                <InputTags id="elements" label="Elements" tags={attr.elements} readonly />
            {/if}
            <InputText id="default" label="Default value" value={attr.default} readonly />
            <InputChoice id="required" label="Required" value={attr.required} disabled>
                Indicate whether this is a required attribute</InputChoice>
            <InputChoice id="array" label="Array" value={attr.array} disabled>
                Indicate whether this attribute should act as an array</InputChoice>
        {/if}
    </FormList>
</Modal>
