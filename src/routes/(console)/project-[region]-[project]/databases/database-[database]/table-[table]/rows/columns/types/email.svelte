<script lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { IconMail } from '@appwrite.io/pink-icons-svelte';
    import InputEmail from '$lib/elements/forms/inputEmail.svelte';

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
    placeholder="name@example.com"
    required={column.required}
    leadingIcon={!limited ? IconMail : undefined} />
