<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';

    export let label: string = null;
    export let id: string;
    export let name = id;
    export let value = '';
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let nullable = false;
    export let readonly = false;
    export let autofocus = false;
    export let autocomplete = false;
    export let maxlength: number | undefined = undefined;

    // https://www.geeksforgeeks.org/how-to-validate-a-domain-name-using-regular-expression/
    const pattern = String.raw`(?!-)[A-Za-z0-9\-]+([\-\.]{1}[a-z0-9]+)*\.[A-Za-z]{2,18}`;

    let error: string;

    const handleInvalid = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
        event.preventDefault();

        if (event.currentTarget.validity.patternMismatch) {
            error = 'Must be a valid domain';
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
    {label}
    {nullable}
    {pattern}
    {maxlength}
    on:input
    on:invalid={handleInvalid}
    type="text"
    helper={error}
    state={error ? 'error' : 'default'}
    autofocus={autofocus || undefined}
    autocomplete={autocomplete ? 'on' : 'off'}
    bind:value />
