<script lang="ts">
    import { page } from '$app/state';
    import { onDestroy } from 'svelte';
    import { goto } from '$app/navigation';
    import { trackEvent } from '$lib/actions/analytics';
    import { Icon, Input } from '@appwrite.io/pink-svelte';
    import { IconSearch, IconX } from '@appwrite.io/pink-icons-svelte';
    import { debounce as createDebounce } from '$lib/helpers/debounce.js';

    interface Props {
        placeholder?: string;
        debounce?: number;
        required?: boolean;
        disabled?: boolean;
        autofocus?: boolean;
    }

    let {
        placeholder = '',
        debounce = 250,
        required = false,
        disabled = false,
        autofocus = false
    }: Props = $props();

    let inputValue = $state(page.url.searchParams.get('search') ?? '');

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

    export function clearInput() {
        inputValue = '';
    }

    onDestroy(() => {
        runSearch.cancel?.();
    });

    $effect(() => {
        const urlSearch = page.url.searchParams.get('search') ?? '';

        if (urlSearch !== inputValue) {
            runSearch(inputValue);
        }
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
