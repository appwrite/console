<script lang="ts">
    import { InputNumber } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: number;
    export let column: Models.ColumnInteger;

    $: nullable = column.required ? false : !value;
</script>

<InputNumber
    {id}
    {label}
    {nullable}
    required={column.required}
    min={column.min}
    max={column.max}
    step={column.type === 'double' ? 'any' : 1}
    bind:value />
