<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem, Helper, Label } from '.';
    import NullCheckbox from './nullCheckbox.svelte';
    import { Drop } from '$lib/components';

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
    export let tooltip: string = null;

    let element: HTMLInputElement;
    let error: string;
    let show = false;

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    const handleInvalid = (event: Event) => {
        event.preventDefault();
        if (element.validity.typeMismatch) {
            error = 'Emails should be formatted as: name@example.com';
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
</script>

<FormItem>
    <Label {required} {optionalText} {tooltip} hide={!showLabel} for={id}>
        {label}{#if $$slots.popover}
            <Drop bind:show display="inline-block">
                <!-- TODO: make unclicked icon greyed out and hover and clicked filled -->
                &nbsp;<button
                    type="button"
                    on:click={() => (show = !show)}
                    class="tooltip"
                    aria-label="input tooltip">
                    <span
                        class="icon-info"
                        aria-hidden="true"
                        style="font-size: var(--icon-size-small)" />
                </button>
                <svelte:fragment slot="list">
                    <div class="dropped card u-max-width-250" style="--p-card-padding: .75rem">
                        <slot name="popover" />
                    </div>
                </svelte:fragment>
            </Drop>
        {/if}
    </Label>

    <div
        class:input-text-wrapper={!$$slots.default}
        class:u-flex={$$slots.default}
        class:u-gap-16={$$slots.default}
        class:u-cross-center={$$slots.default}>
        <input
            {id}
            {placeholder}
            {disabled}
            {required}
            {readonly}
            type="email"
            class="input-text"
            autocomplete={autocomplete ? 'on' : 'off'}
            bind:value
            bind:this={element}
            on:invalid={handleInvalid} />
        {#if nullable && !required}
            <ul
                class="buttons-list u-cross-center u-gap-8 u-position-absolute u-inset-block-start-8 u-inset-block-end-8 u-inset-inline-end-12">
                <li class="buttons-list-item">
                    <NullCheckbox checked={value === null} on:change={handleNullChange} />
                </li>
            </ul>
        {/if}
        <slot />
    </div>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>
