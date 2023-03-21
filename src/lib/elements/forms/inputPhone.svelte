<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem, Helper, Label } from '.';

    export let label: string;
    export let showLabel = true;
    export let id: string;
    export let value = '';
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
    export let autocomplete = false;
    export let maxlength: number = null;

    const pattern = String.raw`^\+?[1-9]\d{1,14}$`;

    let element: HTMLInputElement;
    let error: string;

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    const handleInvalid = (event: Event) => {
        event.preventDefault();

        if (element.validity.patternMismatch) {
            error = "Allowed characters: leading '+' and maximum of 15 digits";
            return;
        }
        if (element.validity.valueMissing) {
            error = 'This field is required';
            return;
        }

        error = element.validationMessage;
    };

    $: if (value) {
        error = null;
    }
</script>

<FormItem>
    <Label {required} hide={!showLabel} for={id}>
        {label}
    </Label>
    <div class="input-text-wrapper">
        <input
            {id}
            {placeholder}
            {disabled}
            {required}
            {maxlength}
            {pattern}
            {readonly}
            type="text"
            autocomplete={autocomplete ? 'on' : 'off'}
            bind:value
            bind:this={element}
            on:invalid={handleInvalid} />
    </div>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>
