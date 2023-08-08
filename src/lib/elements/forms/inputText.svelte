<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem, Helper, Label } from '.';
    import NullCheckbox from './nullCheckbox.svelte';
    import TextCounter from './textCounter.svelte';

    export let label: string;
    export let optionalText: string | undefined = undefined;
    export let showLabel = true;
    export let id: string;
    export let value = '';
    export let placeholder = '';
    export let required = false;
    export let nullable = false;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
    export let autocomplete = false;
    export let fullWidth = false;
    export let maxlength: number = null;
    export let tooltip: string = null;

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

        error = element.validationMessage;
    };

    $: if (value) {
        error = null;
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

    $: showTextCounter = !!maxlength;
    $: showNullCheckbox = nullable && !required;
</script>

<FormItem {fullWidth}>
    <Label {required} {tooltip} {optionalText} hide={!showLabel} for={id}>
        {label}
    </Label>

    <div class="input-text-wrapper">
        <input
            {id}
            {placeholder}
            {disabled}
            {readonly}
            {required}
            {maxlength}
            autocomplete={autocomplete ? 'on' : 'off'}
            type="text"
            class="input-text"
            bind:value
            class:u-padding-inline-end-56={typeof maxlength === 'number'}
            bind:this={element}
            on:invalid={handleInvalid} />
        {#if showTextCounter || showNullCheckbox}
            <ul
                class="buttons-list u-cross-center u-gap-8 u-position-absolute u-inset-block-start-8 u-inset-block-end-8 u-inset-inline-end-12">
                {#if showTextCounter}
                    <li class="buttons-list-item">
                        <TextCounter max={maxlength} count={value?.length ?? 0} />
                    </li>
                {/if}
                {#if showNullCheckbox}
                    <li class="buttons-list-item">
                        <NullCheckbox checked={value === null} on:change={handleNullChange} />
                    </li>
                {/if}
            </ul>
        {/if}
    </div>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>
