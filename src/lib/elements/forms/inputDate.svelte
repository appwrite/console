<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem, Helper, Label } from '.';
    import NullCheckbox from './nullCheckbox.svelte';

    export let label: string;
    export let showLabel = true;
    export let optionalText: string | undefined = undefined;
    export let id: string;
    export let value = '';
    export let required = false;
    export let nullable = false;
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

    let prevValue = '';
    function handleNullChange(e: CustomEvent<boolean>) {
        const isNull = e.detail;
        if (isNull) {
            prevValue = value;
            value = null;
        } else {
            value = prevValue;
        }
    }

    $: if (value) {
        error = null;
    }

    $: isNullable = nullable && !required;
</script>

<FormItem>
    <Label {required} {optionalText} hide={!showLabel} for={id}>
        {label}
    </Label>

    <div class="input-text-wrapper">
        <input
            {id}
            {disabled}
            {readonly}
            {required}
            step=".001"
            autocomplete={autocomplete ? 'on' : 'off'}
            type="date"
            class="input-text"
            bind:value
            bind:this={element}
            on:invalid={handleInvalid}
            style:--amount-of-buttons={isNullable ? 2.75 : 1}
            style:--button-size={isNullable ? '2rem' : '1rem'} />
        {#if isNullable}
            <ul
                class="buttons-list u-cross-center u-gap-8 u-position-absolute u-inset-block-start-8 u-inset-block-end-8 u-inset-inline-end-12">
                <li class="buttons-list-item">
                    <NullCheckbox checked={value === null} on:change={handleNullChange} />
                </li>
            </ul>
        {/if}
    </div>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>
