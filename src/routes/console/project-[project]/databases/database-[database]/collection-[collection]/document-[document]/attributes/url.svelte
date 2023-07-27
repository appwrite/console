<script lang="ts">
    import InputURL from '$lib/elements/forms/inputURL.svelte';
    import type { Models } from '@appwrite.io/console';
    import LL from '$i18n/i18n-svelte';

    export let id: string;
    export let label: string;
    export let value: string | null;
    export let optionalText: string | undefined = undefined;
    export let attribute: Models.AttributeUrl;
</script>

<InputURL
    {id}
    {label}
    {optionalText}
    placeholder={$LL.console.project.forms.databases.attribute.inputs.email.placeholder()}
    showLabel={!!label?.length}
    nullable={!attribute.required}
    required={attribute.required}
    bind:value />
