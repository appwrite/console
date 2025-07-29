<script lang="ts">
    import { InputText, InputTextarea } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: string;
    export let attribute: Models.AttributeString;
</script>

{#if attribute.size >= 50}
    <InputTextarea
        {id}
        {label}
        bind:value
        placeholder="Enter string"
        maxlength={attribute.size}
        required={attribute.required}
        nullable={!attribute.required} />
{:else}
    <InputText
        {id}
        {label}
        bind:value
        placeholder="Enter string"
        maxlength={attribute.size}
        required={attribute.required}
        nullable={!attribute.required} />
{/if}
