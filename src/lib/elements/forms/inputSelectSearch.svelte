<script lang="ts">
    import { DropList } from '$lib/components';
    import { clickOnEnter } from '$lib/helpers/a11y';
    import { createEventDispatcher, onMount } from 'svelte';
    import { Label } from '.';

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
    export let showLabel = true;
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let fullWidth = false;
    export let autofocus = false;
    export let interactiveOutput = false;
    // stretch is used inside of a flex container to give the element flex:1
    export let stretch = true;
    export let search = '';
    // The actual selected value
    export let value: Option['value'];
    $: selectedOption = options.find((option) => option.value === value);

    let element: HTMLInputElement;
    let hasFocus = false;
    let selected: number = null;

    $: if (!hasFocus) {
        selected = null;
    }

    const dispatch = createEventDispatcher();

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    function handleInput() {
        hasFocus = true;
    }

    function handleKeydown(event: KeyboardEvent) {
        event.stopImmediatePropagation();

        switch (event.key) {
            case 'Escape':
                hasFocus = false;
                break;
            case 'ArrowDown':
                if (selected === null) {
                    selected = 0;
                } else {
                    selected = (selected + 1) % options.length;
                }
                break;
            case 'ArrowUp':
                if (selected === null) {
                    selected = options.length - 1;
                } else {
                    selected = (selected - 1 + options.length) % options.length;
                }
                break;
            case 'Enter':
                if (selected !== null) {
                    event.preventDefault();
                    selectOption(options[selected]);
                }
                break;
        }
    }

    function selectOption(option: Option) {
        value = option.value;
        search = option.label;
        // It's not working without this line.
        if ($$slots.output) {
            search = '';
        } else {
            element.value = search;
        }
        hasFocus = false;
        dispatch('select', option);
    }

    function clearOption() {
        search = '';
        value = null;
        !$$slots.output && (element.value = search);
        hasFocus = false;
        dispatch('reset');
    }

    $: showClearBtn = (hasFocus && search) || value;
</script>

<li
    class="u-position-relative form-item"
    class:u-width-full-line={fullWidth}
    class:u-stretch={stretch}>
    <DropList
        bind:show={hasFocus}
        noStyle
        noArrow
        scrollable
        placement="bottom-end"
        position="static"
        fullWidth={true}
        fixed>
        <Label {required} {optionalText} hide={!showLabel} for={id}>
            {label}
        </Label>

        <div class="custom-select">
            <div class="input-text-wrapper" style="--amount-of-buttons:2">
                {#if $$slots.output && selectedOption}
                    <div
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
                        {disabled}
                        {required}
                        bind:value={search}
                        bind:this={element}
                        on:focus={() => (hasFocus = true)}
                        on:click={() => (hasFocus = true)}
                        on:input={handleInput}
                        on:keydown={handleKeydown} />
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
                        on:click={() => (hasFocus = !hasFocus)}>
                        <span class="icon-cheveron-down" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>
        <svelte:fragment slot="list">
            {#each options as option, i}
                <li class="drop-list-item">
                    <button
                        class="drop-button"
                        class:is-selected={selected === i}
                        type="button"
                        on:click|preventDefault={() => {
                            selectOption(option);
                        }}>
                        <slot {option}>
                            <span class="text" data-private>{option.label}</span>
                        </slot>
                    </button>
                </li>
            {:else}
                <li class="drop-list-item">
                    <span class="text">There are no {name} that match your search</span>
                </li>
            {/each}
        </svelte:fragment>
    </DropList>
</li>

<style>
    .form-item :global(.drop) {
        translate: 0 4px;
    }

    .form-item :global(.drop-section) {
        width: 100%;
        margin-inline: initial;
        max-inline-size: initial;
    }
</style>
