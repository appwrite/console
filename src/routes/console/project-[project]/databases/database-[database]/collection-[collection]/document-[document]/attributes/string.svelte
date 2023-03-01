<script lang="ts">
    import InputText from '$lib/elements/forms/inputText.svelte';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: string;
    export let attribute: Models.AttributeString;
    export let optionalText: string | undefined = undefined;
</script>

<InputText
    {id}
    {label}
    {optionalText}
    placeholder="Enter string"
    showLabel={!!label?.length}
    required={attribute.required}
    maxlength={attribute.size}
    bind:value />
