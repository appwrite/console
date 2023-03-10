<script lang="ts">
    import { DropList } from '$lib/components';
    import { onMount } from 'svelte';
    import { Label } from '.';

    export let id: string;
    export let label: string;
    export let optionalText: string | undefined = undefined;
    export let showLabel = true;
    export let value: string | number | boolean;
    export let search: string = null;
    export let placeholder = '';
    export let required = false;
    export let disabled = false;
    export let autofocus = false;
    export let debounce = 250;
    export let options: {
        value: string | boolean | number;
        label: string;
    }[];

    let element: HTMLInputElement;
    let timer: ReturnType<typeof setTimeout>;
    let hasFocus = false;

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    const valueChange = (event: Event) => {
        hasFocus = false;

        clearTimeout(timer);
        timer = setTimeout(() => {
            const target = event.target as HTMLInputElement;
            search = target.value;
        }, debounce);
    };

    $: console.log(options);
</script>

<li class="u-position-relative form-item">
    <DropList
        bind:show={hasFocus}
        noStyle
        noArrow
        scrollable
        placement="bottom-end"
        position="static"
        fullWidth={true}>
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
                    on:input={valueChange} />

                <div class="options-list">
                    <button
                        class="options-list-button"
                        aria-label="clear field"
                        type="button"
                        on:click|preventDefault={() => {
                            element.value = null;
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
            {#if options?.length}
                {#each options as option}
                    <li class="drop-list-item">
                        <button
                            class="drop-button"
                            type="button"
                            on:click|preventDefault={() => {
                                value = option.value;
                                search = option.label;
                                hasFocus = false;
                            }}>
                            <span class="text">{option.label}</span>
                        </button>
                    </li>
                {/each}
            {:else}
                <li class="drop-list-item">
                    <span class="text">There are no documents that match your search</span>
                </li>
            {/if}
        </svelte:fragment>
    </DropList>
</li>
