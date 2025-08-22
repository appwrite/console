<script lang="ts">
    import InputURL from '$lib/elements/forms/inputURL.svelte';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: string | null;
    export let limited: boolean = false;
    export let column: Models.ColumnUrl;

    $: autofocus = limited;
    $: nullable = !limited ? !column.required : false;
</script>

<InputURL
    {id}
    {label}
    bind:value
    {nullable}
    {autofocus}
    placeholder="Enter URL"
    required={column.required} />
