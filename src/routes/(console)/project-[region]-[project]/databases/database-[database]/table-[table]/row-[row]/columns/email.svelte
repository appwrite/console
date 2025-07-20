<script lang="ts">
    import InputEmail from '$lib/elements/forms/inputEmail.svelte';
    import type { Models } from '@appwrite.io/console';

    export let id: string;
    export let label: string;
    export let value: string | null;
    export let column: Models.ColumnEmail;
</script>

<InputEmail
    {id}
    {label}
    bind:value
    placeholder="Enter URL"
    required={column.required}
    nullable={!column.required} />
