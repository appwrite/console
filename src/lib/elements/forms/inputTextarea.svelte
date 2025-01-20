<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';

    export let label: string;
    export let id: string;
    export let name: string = id;
    export let value = '';
    export let placeholder = '';
    export let required = false;
    export let nullable = false;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
    export let maxlength: number = null;

    let error: string;

    const handleInvalid = (event: Event & { currentTarget: EventTarget & HTMLTextAreaElement }) => {
        event.preventDefault();
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

<Input.Textarea
    {id}
    {name}
    {placeholder}
    {disabled}
    {readonly}
    {required}
    {maxlength}
    {label}
    {nullable}
    autofocus={autofocus || undefined}
    helper={error}
    state={error ? 'error' : 'default'}
    on:invalid={handleInvalid}
    on:input
    bind:value />
