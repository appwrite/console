<script lang="ts">
    import { InputSelect } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: string;
    export let column: Models.ColumnEnum;
    export let optionalText: string | undefined = undefined;

    $: options = [
        ...column.elements.map((element) => {
            return {
                label: element,
                value: element
            };
        }),
        !column.required && {
            label: 'NULL',
            value: null
        }
    ].filter(Boolean);
</script>

<InputSelect
    bind:value
    {options}
    {id}
    {label}
    {optionalText}
    required={column.required}
    placeholder="Select a value" />
