<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem, Helper, Label } from '.';

    export let label: string;
    export let showLabel = true;
    export let optionalText: string | undefined = undefined;
    export let id: string;
    export let value = '';
    export let required = false;
    export let min: string | number | undefined = undefined;
    export let max: string | number | undefined = undefined;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
    export let autocomplete = false;

    let element: HTMLInputElement;
    let error: string;

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    function handleInvalid(event: Event) {
        event.preventDefault();

        if (element.validity.valueMissing) {
            error = 'This field is required';
            return;
        }

        error = element.validationMessage;
    }

    $: if (value) {
        error = null;
    }
</script>

<FormItem>
    <Label {required} {optionalText} hide={!showLabel} for={id}>
        {label}
    </Label>

    <div class="input-text-wrapper" style="--amount-of-buttons:1; --button-size: 1rem">
        <input
            {id}
            {disabled}
            {readonly}
            {required}
            {min}
            {max}
            step="60"
            autocomplete={autocomplete ? 'on' : 'off'}
            type="time"
            class="input-text"
            bind:value
            bind:this={element}
            on:invalid={handleInvalid} />
    </div>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>
