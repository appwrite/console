<script lang="ts">
    import { InputText, InputTextarea } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: string;
    export let attribute: Models.AttributeString;
    export let optionalText: string | undefined = undefined;
</script>

{#if attribute.size >= 50}
    <InputTextarea
        {id}
        {label}
        nullable={!attribute.required}
        placeholder="Enter string"
        required={attribute.required}
        maxlength={attribute.size}
        bind:value />
{:else}
    <InputText
        {id}
        {label}
        nullable={!attribute.required}
        placeholder="Enter string"
        required={attribute.required}
        maxlength={attribute.size}
        bind:value />
{/if}
