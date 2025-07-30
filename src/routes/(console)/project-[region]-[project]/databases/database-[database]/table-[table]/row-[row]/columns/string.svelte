<script lang="ts">
    import { InputText, InputTextarea } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: string;
    export let column: Models.ColumnString;
</script>

{#if column.size >= 50}
    <InputTextarea
        {id}
        {label}
        bind:value
        placeholder="Enter string"
        maxlength={column.size}
        required={column.required}
        nullable={!column.required} />
{:else}
    <InputText
        {id}
        {label}
        bind:value
        placeholder="Enter string"
        maxlength={column.size}
        required={column.required}
        nullable={!column.required} />
{/if}
