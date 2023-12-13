<script lang="ts">
    import { clickOnEnter } from '$lib/helpers/a11y';
    import { createCombobox, melt } from '@melt-ui/svelte';
    import { createEventDispatcher, onMount } from 'svelte';
    import { Label } from '.';

    /* eslint no-undef: "off" */
    type Option = $$Generic<{
        value: string | boolean | number;
        label: string;
        data?: string[];
    }>;
    type OptionArray = Option[];

    export let options: OptionArray;
    export let id: string;
    export let label: string;
    export let name = 'elements';
    export let optionalText: string | undefined = undefined;
    export let tooltip: string | undefined = undefined;
    export let showLabel = true;
    export let placeholder = '';
    export let required = false;
    export let hideRequired = false;
    export let disabled = false;
    export let fullWidth = false;
    export let autofocus = false;
    export let interactiveOutput = false;
    // stretch is used inside of a flex container to give the element flex:1
    export let stretch = true;
    export let search = '';

    // The actual selected value
    export let value: Option['value'];

    const {
        elements: { input, menu, option },
        states: { selected: innerSelected, inputValue, open },
        helpers: { isHighlighted },
        options: comboOptions
    } = createCombobox<Option['value']>({
        onSelectedChange({ next }) {
            if (next) {
                value = next.value;
                dispatch('select', next);
            }
            return next;
        },
        preventScroll: false
    });

    $: {
        comboOptions.disabled.set(disabled);
        comboOptions.required.set(required);
    }

    $: inputValue.set(search);
    $: search = $inputValue;
    $: selectedOption = options.find((option) => option.value === value);
    $: selectedOption && innerSelected.set(selectedOption);

    let element: HTMLInputElement;
    let hasFocus = false;

    const dispatch = createEventDispatcher();

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    function handleInput() {
        hasFocus = true;
    }

    function clearOption() {
        inputValue.set('');
        innerSelected.set(null);
        dispatch('reset');
    }

    $: showClearBtn = (hasFocus && search) || value;

    $: console.log(disabled);
</script>

<div
    class="u-position-relative form-item"
    class:u-width-full-line={fullWidth}
    class:u-stretch={stretch}>
    <Label {required} {hideRequired} {optionalText} hide={!showLabel} for={id} {tooltip}>
        {label}
    </Label>

    <div class="custom-select">
        <div class="input-text-wrapper" style="--amount-of-buttons:2">
            {#if $$slots.output && selectedOption}
                <div
                    role="button"
                    tabindex="0"
                    on:keyup={clickOnEnter}
                    on:click={() => {
                        if (interactiveOutput) hasFocus = !hasFocus;
                    }}>
                    <slot name="output" option={selectedOption} />
                </div>
            {:else}
                <input
                    type="text"
                    class="input-text"
                    {placeholder}
                    {required}
                    on:input={handleInput}
                    bind:this={element}
                    use:melt={$input} />
            {/if}

            <div class="options-list">
                {#if showClearBtn}
                    <button
                        class="options-list-button"
                        aria-label="clear field"
                        type="button"
                        disabled={!interactiveOutput}
                        on:click|preventDefault={clearOption}>
                        <span class="icon-x" aria-hidden="true" />
                    </button>
                {/if}
                <button
                    class="options-list-button"
                    type="button"
                    disabled={!interactiveOutput}
                    on:click={() => {
                        hasFocus = !hasFocus;
                        open.set(true);
                    }}>
                    <span class="icon-cheveron-down" aria-hidden="true" />
                </button>
            </div>
        </div>

        <div class="drop-wrapper" use:melt={$menu}>
            <div class="drop is-no-arrow">
                <section class="drop-section">
                    <ul class="drop-list">
                        {#each options as o}
                            <li class="drop-list-item">
                                <button
                                    class="drop-button"
                                    class:is-selected={$isHighlighted(o.value)}
                                    type="button"
                                    use:melt={$option({ value: o.value, label: o.label })}>
                                    <slot option={o}>
                                        <span class="text" data-private>{o.label}</span>
                                    </slot>
                                </button>
                            </li>
                        {:else}
                            <li class="drop-list-item">
                                <span class="text">There are no {name} that match your search</span>
                            </li>
                        {/each}
                    </ul>
                </section>
            </div>
        </div>
    </div>
</div>

<style>
    .form-item :global(.drop) {
        translate: 0 4px;
    }

    .drop-section {
        margin-inline: unset;
        /* padding-inline: unset; */
        max-inline-size: unset;
    }

    .drop {
        position: static;
        inset-inline-start: unset;
        inset-block-end: unset;
        min-inline-size: unset;
        max-inline-size: unset;
        inline-size: unset;
    }
</style>
