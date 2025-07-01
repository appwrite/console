<script lang="ts">
    import { InputText, InputTextarea } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: string;
    export let column: Models.ColumnString;

    $: nullable = column.required ? false : !value;
</script>

{#if column.size >= 50}
    <InputTextarea
        {id}
        {label}
        {nullable}
        placeholder="Enter string"
        required={column.required}
        maxlength={column.size}
        bind:value />
{:else}
    <InputText
        {id}
        {label}
        {nullable}
        placeholder="Enter string"
        required={column.required}
        maxlength={column.size}
        bind:value />
{/if}
