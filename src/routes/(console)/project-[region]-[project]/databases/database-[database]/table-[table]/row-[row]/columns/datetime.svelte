<script lang="ts">
    import { InputDateTime } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: string;
    export let column: Models.ColumnDatetime;
    export let type: 'date' | 'time' | 'datetime-local' = 'datetime-local';
</script>

<InputDateTime
    {id}
    {label}
    {type}
    bind:value
    required={column.required}
    nullable={!column.required} />
