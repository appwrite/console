<script lang="ts">
    import { DropList } from '$lib/components';
    import { onMount } from 'svelte';
    import { Label } from '.';

    export let id: string;
    export let label: string;
    export let optionalText: string | undefined = undefined;
    export let showLabel = true;
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let autofocus = false;
    export let debounce = 250;
    export let options: {
        value: string | boolean | number;
        label: string;
    }[];
    // Input value
    export let search: string = null;
    // The actual selected value
    export let value: string | number | boolean;

    let element: HTMLInputElement;
    let timer: ReturnType<typeof setTimeout>;
    let hasFocus = false;
    let selected: number = null;

    $: if (!hasFocus) {
        selected = null;
    }

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    function handleInput(event: Event) {
        hasFocus = true;
        clearTimeout(timer);
        timer = setTimeout(() => {
            const target = event.target as HTMLInputElement;
            search = target.value;
        }, debounce);
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
                    value = options[selected].value;
                    search = options[selected].label;
                    hasFocus = false;
                }
                break;
        }
    }
</script>

<li class="u-position-relative form-item">
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

                <div class="options-list">
                    <button
                        class="options-list-button"
                        aria-label="clear field"
                        type="button"
                        on:click|preventDefault={() => {
                            search = '';
                            value = null;
                        }}>
                        <span class="icon-x" aria-hidden="true" />
                    </button>
                    <button class="options-list-button" type="button">
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
                            value = option.value;
                            search = option.label;
                            hasFocus = false;
                        }}>
                        <span class="text">{option.label}</span>
                    </button>
                </li>
            {:else}
                <li class="drop-list-item">
                    <span class="text">There are no documents that match your search</span>
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
