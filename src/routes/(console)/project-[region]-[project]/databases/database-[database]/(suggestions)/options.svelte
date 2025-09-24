<script lang="ts">
    import type { Snippet } from 'svelte';
    import { Popover } from '@appwrite.io/pink-svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
    import SideSheet from '../table-[table]/layout/sidesheet.svelte';

    let {
        children,
        tooltipChildren,
        toggleOnTapClick = true,
        onShowStateChanged = null,
        enabled = true
    }: {
        children: Snippet<[toggle: (event: Event) => void]>;
        tooltipChildren: Snippet<[toggle: (event: Event) => void]>;
        toggleOnTapClick?: boolean;
        onShowStateChanged?: (showing: boolean) => void;
        enabled?: boolean;
    } = $props();

    let showSheet = $state(false);

    $effect(() => {
        if (!$isSmallViewport) {
            showSheet = false;
        }
    });
</script>

<Popover let:toggle let:showing portal padding="none" placement="bottom-start">
    {onShowStateChanged?.(showing || showSheet)}

    {#if toggleOnTapClick && $isSmallViewport}
        <button onclick={() => enabled && (showSheet = true)} aria-label="Open column review modal">
            {@render children(toggle)}
        </button>
    {:else}
        <button style:cursor={enabled ? 'pointer' : undefined}>
            {@render children(toggle)}
        </button>
    {/if}

    <div let:toggle slot="tooltip" style:width="480px" style:padding="16px">
        {@render tooltipChildren(toggle)}
    </div>
</Popover>

{#if $isSmallViewport}
    <SideSheet
        bind:show={showSheet}
        title="Edit suggested column"
        submit={{
            text: 'Update',
            onClick: () => {
                showSheet = false;
            }
        }}>
        {@render tooltipChildren(() => (showSheet = false))}
    </SideSheet>
{/if}
