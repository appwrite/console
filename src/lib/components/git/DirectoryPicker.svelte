<script lang="ts">
    import { createTreeView } from '@melt-ui/svelte';
    import { onMount, setContext } from 'svelte';
    import { writable, type Writable } from 'svelte/store';
    import DirectoryItem from '$lib/components/git/DirectoryItem.svelte';
    import { Spinner } from '@appwrite.io/pink-svelte';

    export let expanded: Writable<string[]> = writable(['lib-0', 'tree-0']);
    export let selected: string | undefined;
    export let openTo: string | undefined;
    export let directories: Array<Record<string, unknown>>;
    export let isLoading = true;
    export let onSelect:
        | ((detail: { fullPath: string; hasChildren: boolean; title: string }) => void | Promise<void>)
        | undefined;
    export let onChange: ((detail: { fullPath: string }) => void | Promise<void>) | undefined;

    const ctx = createTreeView({ expanded });
    setContext('tree', ctx);

    const {
        elements: { tree }
    } = ctx;

    let rootContainer: HTMLDivElement | undefined;
    let containerWidth: number | undefined;
    let internalSelected: string | undefined;

    $: internalSelected = selected;

    onMount(() => {
        updateWidth();
        if (openTo) {
            const pathSegments = openTo.split('/').filter(Boolean);
            const pathsToExpand: string[] = [];
            let currentPath = '';
            for (const segment of pathSegments) {
                currentPath += '/' + segment;
                pathsToExpand.push(currentPath);
            }
            if (pathsToExpand.length > 0) {
                expanded?.update((current) => {
                    const next = [...current];
                    pathsToExpand.forEach((path) => {
                        if (!next.includes(path)) {
                            next.push(path);
                        }
                    });
                    return next;
                });
            }
        }
    });

    function updateWidth() {
        containerWidth = rootContainer ? rootContainer.getBoundingClientRect().width : undefined;
    }

    function handleSelect(detail: { fullPath: string; hasChildren: boolean; title: string }) {
        internalSelected = detail.fullPath;
        selected = internalSelected;
        if (onChange) onChange({ fullPath: detail.fullPath });
        if (onSelect) onSelect(detail);
    }

    $: containerWidth = rootContainer ? rootContainer.getBoundingClientRect().width : undefined;
</script>

<svelte:window on:resize={updateWidth} />

<div class="directory-container" class:isLoading {...$tree} bind:this={rootContainer}>
    {#if isLoading}
        <div class="loading-container">
            <Spinner /><span>Loading directory data...</span>
        </div>
    {:else}
        <DirectoryItem
            {directories}
            {containerWidth}
            selectedPath={internalSelected}
            onSelect={handleSelect}
        />
    {/if}
</div>

<style>
    .directory-container {
        width: 560px;
        max-width: 100%;
        height: 316px;
        overflow-y: auto;
        flex-shrink: 0;
        display: flex;
        padding: var(--space-2, 4px);

        border-radius: var(--border-radius-m, 12px);
        border: var(--border-width-s, 1px) solid var(--border-neutral, #ededf0);
        background: var(--bgcolor-neutral-primary, #fff);

        &::-webkit-scrollbar {
            display: none;
        }
    }

    .isLoading {
        justify-content: center;
        align-items: center;
    }

    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--gap-m);
    }
</style>
