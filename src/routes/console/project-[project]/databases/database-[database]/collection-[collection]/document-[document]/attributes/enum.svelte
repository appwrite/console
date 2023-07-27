<script lang="ts">
    import { InputSelect } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import LL from '$i18n/i18n-svelte';

    export let id: string;
    export let label: string;
    export let value: string;
    export let attribute: Models.AttributeEnum;
    export let optionalText: string | undefined = undefined;

    $: options = [
        ...attribute.elements.map((element) => {
            return {
                label: element,
                value: element
            };
        }),
        !attribute.required && {
            label: 'NULL',
            value: null
        }
    ].filter(Boolean);
</script>

<InputSelect
    bind:value
    {options}
    {id}
    {label}
    {optionalText}
    required={attribute.required}
    placeholder={$LL.console.project.forms.databases.attribute.inputs.default.placeholder()}
    showLabel={!!label?.length} />
