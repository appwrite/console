<script lang="ts">
    import { InputSelect } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: boolean;
    export let attribute: Models.AttributeBoolean;
    export let optionalText: string | undefined = undefined;
</script>

<InputSelect
    {id}
    {label}
    {optionalText}
    placeholder="Select a value"
    required={attribute.required}
    options={[
        !attribute.required && { label: 'NULL', value: null },
        { label: 'True', value: true },
        { label: 'False', value: false }
    ].filter(Boolean)}
    bind:value />
