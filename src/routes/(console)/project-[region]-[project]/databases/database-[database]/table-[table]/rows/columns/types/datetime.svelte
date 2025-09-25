<script lang="ts">
    import { onMount } from 'svelte';
    import type { Models } from '@appwrite.io/console';
    import { InputDateTime } from '$lib/elements/forms';
    import { toLocalDateTimeISO } from '$lib/helpers/date';
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

    /**
     * the value from backend will include timezone info,
     * and that's not compatible with the component as it'll go empty.
     */
    onMount(() => (value = value ? toLocalDateTimeISO(value) : value));
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
