<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';
    import type { ComponentType } from 'svelte';

    export let value = '';
    export let autofocus = true;
    export let leadingIcon: ComponentType | undefined = undefined;

    let error = false;

    const pattern = String.raw`^[a-z0-9][a-z0-9\-]*$`;

    const handleInvalid = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
        event.preventDefault();
        error = true; // show on any error
    };

    $: if (value) {
        error = false;
    }
</script>

<Input.Text
    {pattern}
    {autofocus}
    {leadingIcon}
    id="id"
    placeholder="Enter ID"
    maxlength={36}
    autocomplete="off"
    bind:value
    on:input
    on:invalid={handleInvalid}
    state={error ? 'error' : 'default'}
    helper="Allowed characters: lowercase alphanumeric and non-leading hyphen" />
