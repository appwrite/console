<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';

    export let value = '';
    export let autofocus = true;
    export let required = false;

    let error = false;
    const pattern = String.raw`^[a-zA-Z0-9][a-zA-Z0-9._\-]*$`;

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
    {required}
    id="id"
    placeholder="Enter ID"
    maxlength={36}
    autocomplete="off"
    bind:value
    on:invalid={handleInvalid}
    state={error ? 'error' : 'default'}
    helper="Allowed characters: alphanumeric, non-leading hyphen, underscore, period" />
