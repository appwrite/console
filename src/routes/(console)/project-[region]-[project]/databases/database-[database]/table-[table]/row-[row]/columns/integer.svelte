<script lang="ts">
    import { InputNumber } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: number;
    export let column: Models.ColumnInteger;
</script>

<InputNumber
    {id}
    {label}
    bind:value
    min={column.min}
    max={column.max}
    required={column.required}
    nullable={!column.required}
    step={column.type === 'double' ? 'any' : 1} />
