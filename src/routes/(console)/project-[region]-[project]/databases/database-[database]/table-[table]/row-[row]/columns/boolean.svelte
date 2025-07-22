<script lang="ts">
    import { InputSelect } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: boolean;
    export let column: Models.ColumnBoolean;
    export let optionalText: string | undefined = undefined;
</script>

<InputSelect
    {id}
    {label}
    bind:value
    {optionalText}
    placeholder="Select a value"
    required={column.required}
    options={[
        !column.required && { label: 'NULL', value: null },
        { label: 'True', value: true },
        { label: 'False', value: false }
    ].filter(Boolean)} />
