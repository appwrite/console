<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';

    export let label: string;
    export let id: string;
    export let name = id;
    export let value = '';
    export let placeholder = '';
    export let required = false;
    export let nullable = false;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
    export let autocomplete = false;
    export let maxlength: number = null;

    let error: string;

    const handleInvalid = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
        event.preventDefault();

        if (event.currentTarget.validity.patternMismatch) {
            error = 'Must be a valid URL';
            return;
        }
        if (event.currentTarget.validity.valueMissing) {
            error = 'This field is required';
            return;
        }

        error = event.currentTarget.validationMessage;
    };

    $: if (value) {
        error = null;
    }
</script>

<Input.Text
    {id}
    {name}
    {placeholder}
    {disabled}
    {readonly}
    {required}
    {maxlength}
    {label}
    {nullable}
    type="url"
    autofocus={autofocus || undefined}
    autocomplete={autocomplete ? 'on' : 'off'}
    helper={error}
    state={error ? 'error' : 'default'}
    on:invalid={handleInvalid}
    on:input
    bind:value />
