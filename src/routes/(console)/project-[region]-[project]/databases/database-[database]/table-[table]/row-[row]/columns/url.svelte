<script lang="ts">
    import InputURL from '$lib/elements/forms/inputURL.svelte';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: string | null;
    export let column: Models.ColumnUrl;
</script>

<InputURL
    {id}
    {label}
    bind:value
    placeholder="Enter URL"
    required={column.required}
    nullable={!column.required} />
