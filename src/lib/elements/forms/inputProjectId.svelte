<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';

    export let value = '';
    export let autofocus = true;

    let error = false;

    const pattern = String.raw`^[a-z0-9][a-z0-9\-]*$`;

    const handleInvalid = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
        event.preventDefault();

        if (event.currentTarget.validity.patternMismatch) {
            error = true;
            return;
        }
    };

    $: if (value) {
        error = false;
    }
</script>

<Input.Text
    {pattern}
    {autofocus}
    id="id"
    placeholder="Enter ID"
    maxlength={36}
    autocomplete="off"
    bind:value
    on:invalid={handleInvalid}
    state={error ? 'error' : 'default'}
    helper="Allowed characters: lowercase alphanumeric and non-leading hyphen" />
