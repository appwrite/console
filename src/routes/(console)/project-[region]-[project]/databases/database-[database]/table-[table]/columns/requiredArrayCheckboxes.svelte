<script lang="ts">
    import { Selector, Tooltip } from '@appwrite.io/pink-svelte';

    let {
        required = $bindable(false),
        array = $bindable(false),
        editing = false,
        disabled = false
    }: {
        required: boolean;
        array: boolean;
        editing?: boolean;
        disabled?: boolean;
    } = $props();
</script>

<Tooltip disabled={!array || disabled} maxWidth="275px" placement="bottom-start">
    <div style:width="fit-content">
        <Selector.Checkbox
            size="s"
            id="required"
            label="Required"
            bind:checked={required}
            disabled={array || disabled}
            description="Indicate whether this column is required." />
    </div>

    <svelte:fragment slot="tooltip">
        Required cannot be selected because array columns may contain more than one value.
    </svelte:fragment>
</Tooltip>

<Tooltip disabled={!(required || editing) || disabled} maxWidth="275px" placement="bottom-start">
    <div style:width="fit-content">
        <Selector.Checkbox
            size="s"
            id="array"
            label="Array"
            bind:checked={array}
            disabled={required || editing || disabled}
            description="Indicate whether this column is an array. Defaults to an empty array." />
    </div>

    <svelte:fragment slot="tooltip">
        {#if editing}
            Array cannot be selected to avoid data incompatibility.
        {:else}
            Array cannot be selected because required columns must be populated in all rows with a
            single value.
        {/if}
    </svelte:fragment>
</Tooltip>
