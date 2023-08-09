<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem, Helper, Label } from '.';
    import NullCheckbox from './nullCheckbox.svelte';
    import TextCounter from './textCounter.svelte';
    import { clickOnEnter } from '$lib/helpers/a11y';

    export let label: string;
    export let showLabel = true;
    export let id: string;
    export let name: string = id;
    export let value = '';
    export let placeholder = '';
    export let required = false;
    export let nullable = false;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
    export let maxlength: number = null;
    export let optionalText: string | undefined = undefined;
    export let tooltip: string = null;

    let element: HTMLTextAreaElement;
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

    let prevValue = null;
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

<FormItem>
    <Label {required} {tooltip} {optionalText} hide={!showLabel} for={id}>
        {label}
    </Label>

    <div class="input-text-wrapper" on:click on:keyup={clickOnEnter}>
        <textarea
            {id}
            {name}
            {placeholder}
            {disabled}
            {readonly}
            {required}
            {maxlength}
            class="input-text"
            class:u-padding-block-end-32={maxlength}
            style={maxlength ? '--amount-of-buttons: 0.25' : ''}
            bind:value
            bind:this={element}
            on:invalid={handleInvalid}
            style:--amount-of-buttons={required ? undefined : 0.25} />
        {#if showTextCounter || showNullCheckbox}
            <ul
                class="buttons-list u-gap-8 u-cross-center u-position-absolute d u-inset-block-end-1 u-inset-inline-end-1 u-padding-block-8 u-padding-inline-12"
                style="border-end-end-radius:0.0625rem;">
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
