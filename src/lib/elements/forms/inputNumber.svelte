<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';

    export let label: string = null;
    export let id: string;
    export let name = id;
    export let value: number = null;
    export let placeholder = '';
    export let required = false;
    export let nullable = false;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
    export let min: number = null;
    export let max: number = null;
    export let step: number | 'any' = 1;
    export let helper: string = undefined;

    let error: string;

    const handleInvalid = (event: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
        event.preventDefault();

        if (event.currentTarget.validity.valueMissing) {
            error = 'This field is required';
            return;
        }

        if (event.currentTarget.validity.rangeOverflow) {
            error = `The value must be less than or equal to ${max}`;
            return;
        }

        if (event.currentTarget.validity.rangeUnderflow) {
            error = `The value must be greater than or equal to ${min}`;
            return;
        }

        error = event.currentTarget.validationMessage;
    };

    $: if (value) {
        error = null;
    }
</script>

<Input.Number
    {id}
    {name}
    {placeholder}
    {readonly}
    {disabled}
    {required}
    {min}
    {max}
    {label}
    {step}
    {nullable}
    bind:value
    autofocus={autofocus || undefined}
    helper={error || helper}
    state={error ? 'error' : 'default'}
    on:invalid={handleInvalid}
    on:input>
    <svelte:fragment slot="info">
        <slot name="info" slot="info" />
    </svelte:fragment>
</Input.Number>
