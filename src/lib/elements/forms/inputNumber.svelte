<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem, Helper } from '.';

    export let label: string;
    export let showLabel = true;
    export let id: string;
    export let value: number = null;
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let autofocus = false;
    export let maxlength: number = null;
    export let minlength: number = null;
    export let errorMessage = 'An error occurred';
    export let errorType: false | 'success' | 'warning' | 'error' = 'warning';
    export let showHelper = false;

    let element: HTMLInputElement;

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    const handleInvalid = (event: Event) => {
        event.preventDefault();

        errorMessage = element.validationMessage;
        if (element.validity.valueMissing) {
            errorMessage = 'This field is required';
        }

        showHelper = true;
    };

    $: if (value) {
        showHelper = false;
    }
</script>

<FormItem>
    <label class:u-hide={!showLabel} class="label" for={id}>{label}</label>
    <div class="input-text-wrapper">
        <input
            on:invalid={handleInvalid}
            {id}
            {placeholder}
            {disabled}
            {required}
            {minlength}
            {maxlength}
            type="number"
            class="input-text"
            bind:value
            bind:this={element} />
    </div>
    {#if showHelper}
        <Helper type={errorType}>{errorMessage}</Helper>
    {/if}
</FormItem>
