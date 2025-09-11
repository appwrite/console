<script lang="ts">
    import type { Models } from '@appwrite.io/console';
    import InputURL from '$lib/elements/forms/inputURL.svelte';
    import { IconLink } from '@appwrite.io/pink-icons-svelte';

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
    required={column.required}
    leadingIcon={!limited ? IconLink : undefined} />
