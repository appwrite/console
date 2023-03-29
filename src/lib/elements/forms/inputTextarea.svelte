<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem, Helper, Label } from '.';
    import NullCheckbox from './nullCheckbox.svelte';
    import TextCounter from './textCounter.svelte';

    export let label: string;
    export let showLabel = true;
    export let id: string;
    export let value = '';
    export let placeholder = '';
    export let required = false;
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
        console.log(isNull, value, prevValue);
        if (isNull) {
            prevValue = value;
            console.log(prevValue, value);
            value = null;
        } else {
            value = prevValue;
        }
    }
</script>

<FormItem>
    <Label {required} {tooltip} {optionalText} hide={!showLabel} for={id}>
        {label}
    </Label>

    <div class="input-text-wrapper">
        <textarea
            {id}
            {placeholder}
            {disabled}
            {readonly}
            {required}
            {maxlength}
            class="input-text"
            bind:value
            bind:this={element}
            on:invalid={handleInvalid} />
        <ul
            class="buttons-list u-gap-8 u-cross-center u-position-absolute d u-inset-block-end-1 u-inset-inline-end-1 u-padding-block-8 u-padding-inline-12"
            style="border-end-end-radius:0.0625rem;">
            {#if maxlength}
                <li class="buttons-list-item">
                    <TextCounter max={maxlength} count={value?.length ?? 0} />
                </li>
            {/if}
            {#if !required}
                <li class="buttons-list-item">
                    <NullCheckbox checked={value === null} on:change={handleNullChange} />
                </li>
            {/if}
        </ul>
    </div>

    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>
