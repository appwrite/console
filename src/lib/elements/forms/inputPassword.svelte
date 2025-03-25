<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';

    export let id: string;
    export let label: string;
    export let value = '';
    export let helper = '';
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let autofocus = false;
    export let autocomplete = false;
    export let minlength = 8;
    export let maxlength: number = null;

    let error: string;

    const handleInvalid = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
        event.preventDefault();

        if (event.currentTarget.validity.valueMissing) {
            error = 'This field is required';
            return;
        }
        if (event.currentTarget.validity.tooShort) {
            error = 'Password should contain at least 8 characters';
            return;
        }
        error = event.currentTarget.validationMessage;
    };

    $: if (value) {
        error = null;
    }
</script>

<Input.Password
    {id}
    {label}
    {required}
    {disabled}
    {minlength}
    {maxlength}
    {placeholder}
    state={error ? 'error' : 'default'}
    autofocus={autofocus || undefined}
    autocomplete={autocomplete ? 'on' : 'off'}
    helper={helper || error}
    on:invalid={handleInvalid}
    bind:value>
    <slot name="start" slot="start" />
    <slot name="info" slot="info" />
    <slot name="end" slot="end" />
</Input.Password>
