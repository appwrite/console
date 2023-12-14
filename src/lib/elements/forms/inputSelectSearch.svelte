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
            value = next ? next.value : null;
            dispatch('select', next);

            return next;
        },
        preventScroll: false,
        closeOnOutsideClick: false,
        positioning: {
            strategy: 'fixed',
            sameWidth: true,
            placement: 'bottom'
        },
        portal: null,
        ids: id
            ? {
                  trigger: id
              }
            : undefined
    });

    $: {
        comboOptions.disabled.set(disabled);
        comboOptions.required.set(required);
    }

    $: inputValue.set(search);
    $: search = $inputValue;
    $: selectedOption = options.find((option) => option.value === value);
    $: selectedOption && innerSelected.set(selectedOption);

    let inputEl: HTMLInputElement;
    let menuEl: HTMLElement;
    let wrapperEl: HTMLElement;
    let hasFocus = false;

    const dispatch = createEventDispatcher();

    onMount(() => {
        if (inputEl && autofocus) {
            inputEl.focus();
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
    $: showOutput = $$slots.output && selectedOption;
</script>

<svelte:window
    on:click={function clickOutside(e) {
        const el = e.target;
        if (!(el instanceof HTMLElement || el instanceof SVGElement)) {
            open.set(false);
            return;
        }

        if (!menuEl || !wrapperEl) return;

        if (!wrapperEl.contains(el) && !menuEl.contains(el)) {
            hasFocus = false;
            $open = false;
        }
    }} />

<div
    class="u-position-relative form-item"
    class:u-width-full-line={fullWidth}
    class:u-stretch={stretch}
    bind:this={wrapperEl}>
    <Label {required} {hideRequired} {optionalText} hide={!showLabel} for={id} {tooltip}>
        {label}
    </Label>

    <div class="custom-select">
        <div class="input-text-wrapper" style="--amount-of-buttons:2">
            <div class="custom-wrapper" data-show-output={showOutput ? '' : undefined}>
                {#if showOutput}
                    <div
                        role="button"
                        tabindex="0"
                        on:keyup={clickOnEnter}
                        on:click={() => {
                            if (interactiveOutput) {
                                hasFocus = !hasFocus;
                                open.set(true);
                            }
                        }}>
                        <slot name="output" option={selectedOption} />
                    </div>
                {/if}
                <input
                    type="text"
                    class="input-text"
                    {placeholder}
                    {required}
                    on:input={handleInput}
                    bind:this={inputEl}
                    use:melt={$input} />
            </div>

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
                        $open = !$open;
                    }}>
                    <span class="icon-cheveron-down" aria-hidden="true" />
                </button>
            </div>
        </div>

        <div class="drop-wrapper" use:melt={$menu} bind:this={menuEl}>
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

<style lang="scss">
    .form-item :global(.drop) {
        translate: 0 4px;
    }

    .drop-section {
        margin-inline: unset;
        /* padding-inline: unset; */
        max-inline-size: unset;
    }

    .drop-wrapper {
        z-index: 99999;
    }

    .drop {
        position: static;
        inset-inline-start: unset;
        inset-block-end: unset;
        min-inline-size: unset;
        max-inline-size: unset;
        inline-size: unset;
    }

    .custom-wrapper {
        position: relative;

        &[data-show-output] {
            input {
                position: absolute;
                inset: 0;
                pointer-events: none;
                opacity: 0;
            }
        }
    }
</style>
