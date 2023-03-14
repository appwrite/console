<script lang="ts">
    import { onMount } from 'svelte';
    import { onDestroy } from 'svelte';

    export let value = '';
    export let placeholder = '';
    export let debounce = 250;
    export let required = false;
    export let disabled = false;
    export let autofocus = false;
    export let isWithEndButton = true;

    let element: HTMLInputElement;
    let timer: ReturnType<typeof setTimeout>;

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    onDestroy(() => {
        value = '';
        if (timer) {
            clearTimeout(timer);
        }
    });

    const valueChange = (event: Event) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            const target = event.target as HTMLInputElement;
            value = target.value;
        }, debounce);
    };

    $: if (!value) {
        if (element) {
            element.value = value;
        }
    }
</script>

<div class="input-text-wrapper" class:is-with-end-button={isWithEndButton}>
    <input
        {placeholder}
        {disabled}
        {required}
        type="search"
        class="input-text"
        bind:this={element}
        on:input={valueChange} />
    <span class="icon-search" aria-hidden="true" />
    {#if isWithEndButton && value}
        <button
            class="button is-text is-only-icon"
            style="--button-size:1.5rem;"
            aria-label="Clear search"
            on:click={() => (value = '')}>
            <span class="icon-x" aria-hidden="true" />
        </button>
    {/if}
</div>
