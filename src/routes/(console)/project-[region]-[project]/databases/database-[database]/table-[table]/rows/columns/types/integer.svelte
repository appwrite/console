<script lang="ts">
    import { InputNumber } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: number;
    export let limited: boolean = false;
    export let column: Models.ColumnInteger;

    $: autofocus = limited;
    $: nullable = !limited ? !column.required : false;
    $: if (limited) {
        label = undefined;
    }
</script>

<InputNumber
    {id}
    {label}
    bind:value
    {nullable}
    {autofocus}
    min={column.min}
    max={column.max}
    required={column.required}
    step={column.type === 'double' ? 'any' : 1} />
