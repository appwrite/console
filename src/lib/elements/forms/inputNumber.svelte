<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem, FormItemPart, Helper, Label } from '.';
    import NullCheckbox from './nullCheckbox.svelte';

    export let label: string | undefined = undefined;
    export let optionalText: string | undefined = undefined;
    export let showLabel = true;
    export let id: string;
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
    export let isMultiple = false;
    export let fullWidth = false;

    let element: HTMLInputElement;
    let error: string;

    onMount(() => {
        if (autofocus) {
            addInputFocus();
        }
    });

    export function addInputFocus() {
        if (element) {
            element.focus();
        }
    }

    const handleInvalid = (event: Event) => {
        event.preventDefault();

        if (element.validity.valueMissing) {
            error = 'This field is required';
            return;
        }

        if (element.validity.rangeOverflow) {
            error = `The value must be less than or equal to ${max}`;
            return;
        }

        if (element.validity.rangeUnderflow) {
            error = `The value must be greater than or equal to ${min}`;
            return;
        }

        error = element.validationMessage;
    };

    $: if (value) {
        error = null;
    }

    let prevValue = 0;
    function handleNullChange(e: CustomEvent<boolean>) {
        const isNull = e.detail;
        if (isNull) {
            prevValue = value;
            value = null;
        } else {
            value = prevValue;
        }
    }

    $: wrapper = isMultiple ? FormItemPart : FormItem;
</script>

<svelte:component this={wrapper} {fullWidth}>
    {#if label}
        <Label {required} {optionalText} hide={!showLabel} for={id}>
            {label}
        </Label>
    {/if}

    <div class="input-text-wrapper">
        <input
            {id}
            {placeholder}
            {disabled}
            {required}
            {min}
            {max}
            {readonly}
            {step}
            type="number"
            class="input-text u-remove-input-number-buttons"
            bind:value
            bind:this={element}
            on:invalid={handleInvalid}
            style:--amount-of-buttons={nullable && !required ? 1.75 : 0} />
        <ul
            class="buttons-list u-cross-center u-gap-8 u-position-absolute u-inset-block-start-8 u-inset-block-end-8 u-inset-inline-end-12">
            {#if nullable && !required}
                <li class="buttons-list-item">
                    <NullCheckbox checked={value === null} on:change={handleNullChange} />
                </li>
            {/if}
        </ul>
    </div>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</svelte:component>
