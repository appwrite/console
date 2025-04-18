<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';

    export let label: string = null;
    export let id: string;
    export let name: string = id;
    export let value = '';
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
    export let autocomplete = false;
    export let minlength: number = null;
    export let maxlength: number = 15;
    export let nullable = false;

    const pattern = String.raw`^\+[1-9]\d{1,14}$`;

    let error: string;

    const handleInvalid = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
        event.preventDefault();

        if (event.currentTarget.validity.valueMissing) {
            error = 'This field is required';
            return;
        }

        if (event.currentTarget.validity.patternMismatch) {
            error = `Allowed characters: leading '+' and maximum of ${maxlength - 1} digits`;
            return;
        }

        if (event.currentTarget.validity.tooShort) {
            error = `The value must contain leading ‘+’ and at least ${minlength - 1} digits `;
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
    {required}
    {readonly}
    {label}
    {nullable}
    {pattern}
    on:input
    on:invalid={handleInvalid}
    type="text"
    helper={error}
    state={error ? 'error' : 'default'}
    autofocus={autofocus || undefined}
    autocomplete={autocomplete ? 'on' : 'off'}
    bind:value>
    <slot name="start" slot="start" />
    <slot name="info" slot="info" />
    <slot name="end" slot="end" />
</Input.Text>
