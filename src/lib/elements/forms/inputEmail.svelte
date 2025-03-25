<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';

    export let label: string = null;
    export let id: string;
    export let value = '';
    export let placeholder = '';
    export let name: string | undefined = undefined;
    export let required = false;
    export let nullable = false;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
    export let autocomplete = false;

    let error: string;

    const handleInvalid = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
        event.preventDefault();

        if (event.currentTarget.validity.typeMismatch) {
            error = 'Emails should be formatted as: name@example.com';
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
    {required}
    {readonly}
    {label}
    {nullable}
    on:input
    on:invalid={handleInvalid}
    type="email"
    helper={error}
    state={error ? 'error' : 'default'}
    autofocus={autofocus || undefined}
    autocomplete={autocomplete ? 'on' : 'off'}
    bind:value>
    <slot name="start" slot="start" />
    <slot name="info" slot="info" />
    <slot name="end" slot="end" />
</Input.Text>
