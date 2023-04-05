<script lang="ts">
    import InputText from '$lib/elements/forms/inputText.svelte';
    import InputTextarea from '$lib/elements/forms/inputTextarea.svelte';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: string;
    export let attribute: Models.AttributeString;
    export let optionalText: string | undefined = undefined;
</script>

{#if attribute.size > 64}
    <InputTextarea
        {id}
        {label}
        {optionalText}
        placeholder="Enter string"
        showLabel={!!label?.length}
        required={attribute.required}
        maxlength={attribute.size}
        bind:value />
{:else}
    <InputText
        {id}
        {label}
        {optionalText}
        placeholder="Enter string"
        showLabel={!!label?.length}
        required={attribute.required}
        maxlength={attribute.size}
        bind:value />
{/if}
