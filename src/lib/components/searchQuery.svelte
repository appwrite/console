<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { trackEvent } from '$lib/actions/analytics';
    import { onMount } from 'svelte';
    import { onDestroy } from 'svelte';
    import { Icon, Input } from '@appwrite.io/pink-svelte';
    import { IconSearch, IconX } from '@appwrite.io/pink-icons-svelte';

    export let search = '';
    export let placeholder = '';
    export let debounce = 250;
    export let required = false;
    export let disabled = false;
    export let autofocus = false;

    let element: HTMLInputElement;
    let timer: ReturnType<typeof setTimeout>;

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    onDestroy(() => {
        search = '';
        if (timer) {
            clearTimeout(timer);
        }
    });

    $: valueChange(search ?? '');

    function valueChange(value: string) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            const url = new URL(page.url);
            const previous = url.searchParams.get('search') ?? '';

            if (previous === value) {
                return;
            }

            if (page.data.page > 1) {
                url.searchParams.delete('page');
            }

            if (value === '') {
                url.searchParams.delete('search');
            } else {
                url.searchParams.set('search', value);
            }

            trackEvent('search');
            goto(url, { keepFocus: true });
        }, debounce);
    }
</script>

<div style:max-width="360px" style:width="100%">
    <Input.Text
        {placeholder}
        {disabled}
        {required}
        bind:value={search}
        --bgcolor-neutral-default="var(--bgcolor-neutral-primary)">
        <svelte:fragment slot="start">
            <Icon icon={IconSearch} />
        </svelte:fragment>
        <svelte:fragment slot="end">
            {#if search}
                <Input.Action icon={IconX} on:click={() => (search = '')} />
            {/if}
        </svelte:fragment>
    </Input.Text>
</div>
