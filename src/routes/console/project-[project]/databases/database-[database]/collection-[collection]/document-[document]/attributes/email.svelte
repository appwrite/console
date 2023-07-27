<script lang="ts">
    import InputEmail from '$lib/elements/forms/inputEmail.svelte';
    import type { Models } from '@appwrite.io/console';
    import LL from '$i18n/i18n-svelte';

    export let id: string;
    export let label: string;
    export let value: string | null;
    export let optionalText: string | undefined = undefined;
    export let attribute: Models.AttributeUrl;
</script>

<InputEmail
    {id}
    {label}
    {optionalText}
    placeholder={$LL.console.project.forms.databases.attribute.inputs.email.placeholder()}
    showLabel={!!label?.length}
    required={attribute.required}
    bind:value />
