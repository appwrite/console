<script lang="ts">
    import { InputText, InputTextarea } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: string;
    export let limited: boolean = false;
    export let column: Models.ColumnString;

    $: autofocus = limited;
    $: maxlength = limited ? undefined : column.size;

    // TODO: do we need the nullable checkbox?
    $: nullable = !limited ? !column.required : false;
</script>

{#if column.size >= 50}
    <InputTextarea
        {id}
        {label}
        bind:value
        {maxlength}
        {autofocus}
        placeholder="Enter string"
        required={column.required}
        {nullable} />
{:else}
    <InputText
        {id}
        {label}
        bind:value
        {nullable}
        {autofocus}
        {maxlength}
        placeholder="Enter string"
        required={column.required} />
{/if}
