<script lang="ts">
    import { InputText, InputTextarea } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: string;
    export let attribute: Models.AttributeString;
    export let optionalText: string | undefined = undefined;
    export let disabled = false;
</script>

{#if attribute.size >= 50}
    <InputTextarea
        {id}
        {label}
        nullable
        placeholder="Enter string"
        showLabel={!!label?.length}
        required={attribute.required}
        maxlength={attribute.size}
        {disabled}
        bind:value />
{:else}
    <InputText
        {id}
        {label}
        {optionalText}
        nullable
        placeholder="Enter string"
        showLabel={!!label?.length}
        required={attribute.required}
        maxlength={attribute.size}
        {disabled}
        bind:value />
{/if}
