<script lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { InputDateTime } from '$lib/elements/forms';
    import { IconCalendar } from '@appwrite.io/pink-icons-svelte';

    export let id: string;
    export let label: string;
    export let value: string;
    export let limited: boolean = false;
    export let column: Models.ColumnDatetime;
    export let type: 'date' | 'time' | 'datetime-local' = 'datetime-local';

    $: autofocus = limited;
    $: nullable = !limited ? !column.required : false;
    $: if (limited) {
        label = undefined;
    }
</script>

<InputDateTime
    {id}
    {label}
    {type}
    bind:value
    {nullable}
    {autofocus}
    required={column.required}
    leadingIcon={!limited ? IconCalendar : undefined} />
