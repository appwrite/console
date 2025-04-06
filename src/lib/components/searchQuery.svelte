<script lang="ts">
    import { onMount } from 'svelte';
    import { onDestroy } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { trackEvent } from '$lib/actions/analytics';
    import { debounce as createDebounce } from '$lib/helpers/debounce.js';

    export let search = '';
    export let placeholder = '';
    export let debounce = 250;
    export let required = false;
    export let disabled = false;
    export let autofocus = false;
    export let isWithEndButton = true;
    export let fullWidth = false;

    let element: HTMLInputElement;
    let inputValue = $page.url.searchParams.get('search') ?? '';

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    const runSearch = createDebounce((value: string) => {
        const trimmed = value.trim();
        const url = new URL($page.url);
        const previous = url.searchParams.get('search') ?? '';

        if (previous === trimmed) return;

        if ($page.data.page > 1) {
            url.searchParams.delete('page');
        }

        if (trimmed === '') {
            url.searchParams.delete('search');
        } else {
            url.searchParams.set('search', trimmed);
        }

        trackEvent('search');
        goto(url, { keepFocus: true });
    }, debounce);

    $: runSearch(inputValue);

    function clearInput() {
        inputValue = '';
    }

    onDestroy(() => {
        runSearch.cancel?.();
    });
</script>

<div class="u-flex u-gap-12 common-section u-main-space-between">
    <div class={fullWidth ? 'u-width-full-line' : 'u-flex-basis-50-percent'}>
        <div class="input-text-wrapper" class:is-with-end-button={isWithEndButton}>
            <input
                {placeholder}
                {disabled}
                {required}
                type="search"
                class="input-text"
                bind:this={element}
                bind:value={inputValue} />
            <span class="icon-search" aria-hidden="true"></span>
            {#if isWithEndButton && search}
                <button
                    class="button is-text is-only-icon"
                    style="--button-size:1.5rem;"
                    aria-label="Clear search"
                    on:click={clearInput}>
                    <span class="icon-x" aria-hidden="true"></span>
                </button>
            {/if}
        </div>
    </div>
    <slot />
</div>
