<script lang="ts">
    import { InputNumber } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import { IconHashtag } from '@appwrite.io/pink-icons-svelte';

    export let id: string;
    export let label: string;
    export let value: number;
    export let limited: boolean = false;
    export let column: Models.ColumnInteger | Models.ColumnFloat;

    const FLOAT_INPUT_STEP = 0.001;

    $: autofocus = limited;
    $: nullable = !limited ? !column.required : false;
    $: isDecimalColumn = ['double', 'float'].includes(column.type as string);
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
    step={isDecimalColumn ? FLOAT_INPUT_STEP : 1}
    leadingIcon={!limited ? IconHashtag : undefined} />
