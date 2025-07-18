<script lang="ts">
    import { InputNumber } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: number;
    export let attribute: Models.AttributeInteger;
</script>

<InputNumber
    {id}
    {label}
    bind:value
    min={attribute.min}
    max={attribute.max}
    required={attribute.required}
    nullable={!attribute.required}
    step={attribute.type === 'double' ? 'any' : 1} />
