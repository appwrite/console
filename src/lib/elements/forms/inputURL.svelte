<script lang="ts">
    import type { Nullable } from '$lib/helpers/type';
    import { onMount } from 'svelte';

    import { FormItem, Helper } from '.';

    export let label: string;
    export let showLabel = true;
    export let id: string;
    export let value: Nullable<string> = '';
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
    export let autocomplete = false;
    export let maxlength: number | null = null;

    let element: HTMLInputElement;
    let error: Nullable<string>;

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    const handleInvalid = (event: Event) => {
        event.preventDefault();

        if (element.validity.patternMismatch) {
            error = 'Must be a valid URL';
            return;
        }
        if (element.validity.valueMissing) {
            error = 'This field is required';
            return;
        }

        error = element.validationMessage;
    };

    const handleInput = () => {
        if (value === '') {
            value = null;
        }
    };

    $: if (value) {
        error = null;
    }
</script>

<FormItem>
    <label class:u-hide={!showLabel} class="label" for={id}>{label}</label>
    <div class="input-text-wrapper">
        <input
            {id}
            {placeholder}
            {disabled}
            {required}
            {maxlength}
            {readonly}
            type="url"
            autocomplete={autocomplete ? 'on' : 'off'}
            bind:value
            on:input={handleInput}
            bind:this={element}
            on:invalid={handleInvalid} />
    </div>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>
