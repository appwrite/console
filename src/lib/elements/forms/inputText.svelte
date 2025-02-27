<script lang="ts">
    import { SvelteComponent, onMount, tick } from 'svelte';
    import { FormItem, FormItemPart, Helper, Label } from '.';
    import NullCheckbox from './nullCheckbox.svelte';
    import TextCounter from './textCounter.svelte';
    import { Drop } from '$lib/components';

    export let label: string = undefined;
    export let optionalText: string | undefined = undefined;
    export let showLabel = true;
    export let id: string;
    export let name: string = id;
    export let value = '';
    export let pattern: string = null;
    export let patternError: string = '';
    export let placeholder = '';
    export let required = false;
    export let hideRequired = false;
    export let nullable = false;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
    export let autocomplete = false;
    export let fullWidth = false;
    export let maxlength: number = null;
    export let tooltip: string = null;
    export let isMultiple = false;
    export let popover: typeof SvelteComponent<unknown> = null;
    export let popoverProps: Record<string, unknown> = {};

    let element: HTMLInputElement;
    let error: string;
    let show = false;

    onMount(async () => {
        if (element && autofocus) {
            await tick();
            element.focus();
        }
    });

    const handleInvalid = (event: Event) => {
        event.preventDefault();

        if (element.validity.valueMissing) {
            error = 'This field is required';
            return;
        }

        if (patternError && element.validity.patternMismatch) {
            error = patternError;
            return;
        }

        error = element.validationMessage;
    };

    $: {
        value;
        if (element?.validity?.valid) {
            error = null;
        }
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

    type $$Events = {
        input: Event & { target: HTMLInputElement };
    };

    $: wrapper = isMultiple ? FormItemPart : FormItem;
</script>

<svelte:component this={wrapper} {fullWidth}>
    {#if label}
        <Label {required} {hideRequired} {tooltip} {optionalText} hide={!showLabel} for={id}>
            {label}{#if popover}
                <Drop isPopover bind:show display="inline-block">
                    <!-- TODO: make unclicked icon greyed out and hover and clicked filled -->
                    &nbsp;<button
                        type="button"
                        on:click={() => (show = !show)}
                        class="tooltip"
                        aria-label="input tooltip">
                        <span
                            class="icon-info"
                            aria-hidden="true"
                            style:font-size="var(--icon-size-small)" />
                    </button>
                    <svelte:fragment slot="list">
                        <div
                            class="dropped card u-max-width-250"
                            style:--p-card-padding=".75rem"
                            style:--card-border-radius="var(--border-radius-small)"
                            style:box-shadow="var(--shadow-large)">
                            <svelte:component this={popover} {...popoverProps} />
                        </div>
                    </svelte:fragment>
                </Drop>
            {/if}
        </Label>
    {/if}

    <div
        class:input-text-wrapper={!$$slots.default}
        class:u-flex={$$slots.default}
        class:u-gap-8={$$slots.default}
        class:u-cross-center={$$slots.default}>
        <input
            {id}
            {name}
            {placeholder}
            {disabled}
            {readonly}
            {required}
            {pattern}
            {maxlength}
            autocomplete={autocomplete ? 'on' : 'off'}
            type="text"
            class="input-text"
            bind:value
            class:u-padding-inline-end-56={typeof maxlength === 'number'}
            bind:this={element}
            on:invalid={handleInvalid}
            on:input />
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
        <slot />
    </div>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</svelte:component>
