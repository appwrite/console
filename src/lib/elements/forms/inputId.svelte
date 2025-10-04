<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';
    import type { ComponentType } from 'svelte';

    export let value = '';
    export let autofocus = true;
    export let required = false;
    export let leadingIcon: ComponentType | undefined = undefined;

    let error = false;
    const pattern = String.raw`^[a-zA-Z0-9][a-zA-Z0-9._\-]*$`;

    const handleInvalid = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
        event.preventDefault();
        error = true;
    };

    $: if (value) {
        error = false;
    }
</script>

<Input.Text
    {pattern}
    {autofocus}
    {required}
    {leadingIcon}
    id="id"
    placeholder="Enter ID"
    maxlength={36}
    autocomplete="off"
    bind:value
    on:input
    on:invalid={handleInvalid}
    state={error ? 'error' : 'default'}
    helper="Allowed characters: alphanumeric, non-leading hyphen, underscore, period" />
