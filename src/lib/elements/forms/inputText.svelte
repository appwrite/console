<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';

    export let label: string = undefined;
    export let id: string;
    export let name: string = id;
    export let helper: string = undefined;
    export let value = '';
    export let pattern: string = undefined; //TODO: implement pattern check
    export let patternError: string = '';
    export let placeholder = '';
    export let required = false;
    export let nullable = false;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
    export let autocomplete = false;
    export let maxlength: number = null;

    export let error: string = null;

    const handleInvalid = (event: Event) => {
        event.preventDefault();

        const inputNode = event.currentTarget as HTMLInputElement;

        if (inputNode.validity.valueMissing) {
            error = 'This field is required';
            return;
        }

        error = inputNode.validationMessage;
        if (patternError && inputNode.validity.patternMismatch) {
            error = patternError;
            return;
        }

        error = inputNode.validationMessage;
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
    {maxlength}
    {label}
    {nullable}
    {readonly}
    {pattern}
    autofocus={autofocus || undefined}
    autocomplete={autocomplete ? 'on' : 'off'}
    helper={error || helper}
    state={error ? 'error' : 'default'}
    on:invalid={handleInvalid}
    on:input
    bind:value>
    <slot name="start" slot="start" />
    <slot name="info" slot="info" />
    <slot name="end" slot="end" />
</Input.Text>
