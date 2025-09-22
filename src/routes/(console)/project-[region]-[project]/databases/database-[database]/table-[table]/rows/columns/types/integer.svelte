<script lang="ts">
    import { InputNumber } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import { isWithinSafeRange } from '$lib/helpers/numbers';
    import { IconHashtag } from '@appwrite.io/pink-icons-svelte';

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

    $: {
        column.min = isWithinSafeRange(column.min) ? column.min : Number.MIN_SAFE_INTEGER;
        column.max = isWithinSafeRange(column.max) ? column.max : Number.MAX_SAFE_INTEGER;
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
    step={column.type === 'double' ? 'any' : 1}
    leadingIcon={!limited ? IconHashtag : undefined} />
