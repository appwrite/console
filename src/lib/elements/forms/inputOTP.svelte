<script lang="ts">
    import { onMount } from 'svelte';
    import { Input } from '@appwrite.io/pink-svelte';

    export let label: string = undefined;
    export let id: string;
    export let name: string = id;
    export let value = '';
    export let pattern: string = null;
    export let patternError: string = '';
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let readonly = false;
    export let maxlength: number = null;
    export let autofocus = false;
    export let autocomplete = false;

    let element: HTMLInputElement;
    let error: string;

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    const handleInvalid = (event: Event) => {
        event.preventDefault();

        if (element.validity.valueMissing) {
            error = 'This field is required';
            return;
        }

        if (patternError && element.validity.patternMismatch) {
            error = patternError;
            return;
        }

        error = element.validationMessage;
    };

    $: if (value) {
        error = null;
    }

    type $$Events = {
        input: Event & { target: HTMLInputElement };
    };
</script>

<Input.Text
    {id}
    {name}
    {placeholder}
    {disabled}
    {required}
    {maxlength}
    {label}
    {pattern}
    {readonly}
    autofocus={autofocus || undefined}
    autocomplete={autocomplete ? 'on' : 'off'}
    helper={error}
    state={error ? 'error' : 'default'}
    on:invalid={handleInvalid}
    on:input
    bind:value>
    <slot name="start" slot="start" />
    <slot name="info" slot="info" />
    <slot name="end" slot="end" />
</Input.Text>
