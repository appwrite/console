<script lang="ts">
    import { InputNumber } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: number;
    export let attribute: Models.AttributeInteger;
    export let optionalText: string | undefined = undefined;
</script>

<InputNumber
    {id}
    {label}
    {optionalText}
    nullable
    required={attribute.required}
    min={attribute.min}
    max={attribute.max}
    step={attribute.type === 'double' ? 'any' : 1}
    bind:value />
