<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';
    import type ComboBox from '@appwrite.io/pink-svelte/dist/input/ComboBox.svelte';
    import type { ComponentProps } from 'svelte';

    export let options: ComponentProps<ComboBox>['options'];
    export let id: string;
    export let label: string;
    export let placeholder = '';
    export let required = false;
    export let hideRequired = false;
    export let disabled = false;
    export let value: ComponentProps<ComboBox>['value'];

    let element: HTMLInputElement;
    let error: string | null;

    function handleInvalid(event: Event) {
        event.preventDefault();

        if (element.validity.valueMissing) {
            error = 'This field is required';
            return;
        }
        error = element.validationMessage;
    }

    $: if (value) error = null;
</script>

<!-- <Input.ComboBox {label} {id} {placeholder} {disabled} {name} bind:value {required} {options} /> -->

<!-- 
<div
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
        fixed>
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
                        {disabled}
                        {required}
                        bind:value={search}
                        bind:this={element}
                        on:focus={() => (hasFocus = true)}
                        on:click={() => (hasFocus = true)}
                        on:invalid={handleInvalid}
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
                    <button
                        class:drop-button={interactiveEmpty}
                        type="button"
                        on:click={() => {
                            if (interactiveOutput && interactiveEmpty) hasFocus = !hasFocus;
                        }}>
                        <slot name="empty">
                            <span class="text">
                                There are no {name} that match your search
                            </span>
                        </slot>
                    </button>
                </li>
            {/each}
        </svelte:fragment>
        <svelte:fragment slot="other">
            {#if $$slots.listEnd}
                <section class="drop-section">
                    <ul class="drop-list">
                        <li class="drop-list-item">
                            <slot name="listEnd" />
                        </li>
                    </ul>
                </section>
            {/if}
        </svelte:fragment>
    </DropList>
    {#if error}
        <Helper class="u-position-relative" type="warning">{error}</Helper>
    {/if}
</div> -->
