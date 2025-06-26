<script lang="ts">
    import InputEmail from '$lib/elements/forms/inputEmail.svelte';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: string | null;
    export let column: Models.ColumnEmail;

    $: nullable = column.required ? false : !value;
</script>

<InputEmail
    {id}
    {label}
    {nullable}
    placeholder="Enter Email"
    required={column.required}
    bind:value />
