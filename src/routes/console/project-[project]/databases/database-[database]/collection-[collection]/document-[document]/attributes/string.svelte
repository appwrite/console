<script lang="ts">
    import { InputText, InputTextarea } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import LL from '$i18n/i18n-svelte';

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
        placeholder={$LL.console.project.forms.databases.attribute.inputs.string.placeholder()}
        showLabel={!!label?.length}
        required={attribute.required}
        maxlength={attribute.size}
        bind:value />
{:else}
    <InputText
        {id}
        {label}
        {optionalText}
        nullable={!attribute.required}
        placeholder={$LL.console.project.forms.databases.attribute.inputs.string.placeholder()}
        showLabel={!!label?.length}
        required={attribute.required}
        maxlength={attribute.size}
        bind:value />
{/if}
