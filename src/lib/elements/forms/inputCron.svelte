<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';

    export let label: string = null;
    export let id: string;
    export let name = id;
    export let value: string = null;
    export let placeholder = '* * * * *';
    export let required = false;
    export let disabled = false;
    export let readonly = false;
    export let nullable = false;
    export let autofocus = false;

    let error: string;

    const pattern = String.raw`^.*\s+.*\s+.*\s+.*\s+.*`;

    const handleInvalid = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
        event.preventDefault();

        if (event.currentTarget.validity.valueMissing) {
            error = 'This field is required';
            return;
        }

        if (event.currentTarget.validity.patternMismatch) {
            error = 'Please enter a valid Cron expression';
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
    on:input
    on:invalid={handleInvalid}
    type="email"
    helper={error}
    state={error ? 'error' : 'default'}
    autofocus={autofocus || undefined}
    bind:value />
