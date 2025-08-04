<script lang="ts">
    import InputEmail from '$lib/elements/forms/inputEmail.svelte';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: string | null;
    export let limited: boolean = false;
    export let column: Models.ColumnEmail;

    $: autofocus = limited;
    $: nullable = !limited ? !column.required : false;
</script>

<InputEmail
    {id}
    {label}
    bind:value
    {nullable}
    {autofocus}
    placeholder="Enter URL"
    required={column.required} />
