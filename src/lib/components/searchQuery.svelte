<script lang="ts">
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { onMount, onDestroy } from 'svelte';
    import { trackEvent } from '$lib/actions/analytics';
    import { Icon, Input } from '@appwrite.io/pink-svelte';
    import { IconSearch, IconX } from '@appwrite.io/pink-icons-svelte';
    import { debounce as createDebounce } from '$lib/helpers/debounce.js';

    export let placeholder = '';
    export let debounce = 250;
    export let required = false;
    export let disabled = false;
    export let autofocus = false;

    let inputValue = page.url.searchParams.get('search') ?? '';

    const runSearch = createDebounce((value: string) => {
        const trimmed = value.trim();
        const url = new URL(page.url);
        const previous = url.searchParams.get('search') ?? '';

        if (previous === trimmed) return;

        if (page.data.page > 1) {
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

<div style:max-width="360px" style:width="100%">
    <Input.Text
        {placeholder}
        {disabled}
        {required}
        {autofocus}
        bind:value={inputValue}
        --bgcolor-neutral-default="var(--bgcolor-neutral-primary)">
        <svelte:fragment slot="start">
            <Icon icon={IconSearch} />
        </svelte:fragment>
        <svelte:fragment slot="end">
            {#if inputValue}
                <Input.Action icon={IconX} on:click={clearInput} />
            {/if}
        </svelte:fragment>
    </Input.Text>
</div>
