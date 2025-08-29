<script lang="ts">
    import { InputSelect } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: boolean;
    export let limited: boolean = false;
    export let column: Models.ColumnBoolean;
    export let optionalText: string | undefined = undefined;

    $: if (limited) {
        label = undefined;
        optionalText = undefined;
    }

    $: options = [
        !column.required && { label: 'NULL', value: null },
        { label: limited ? 'true' : 'True', value: true },
        { label: limited ? 'false' : 'False', value: false }
    ].filter(Boolean);
</script>

<InputSelect
    {id}
    {label}
    bind:value
    {options}
    {optionalText}
    autofocus={limited}
    placeholder="Select a value"
    required={column.required} />
