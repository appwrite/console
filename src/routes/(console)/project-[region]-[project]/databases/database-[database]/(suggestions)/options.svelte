<script lang="ts">
    import type { Snippet } from 'svelte';
    import { Popover } from '@appwrite.io/pink-svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
    import SideSheet from '../table-[table]/layout/sidesheet.svelte';

    let {
        children,
        tooltipChildren,
        mobileFooterChildren,
        toggleOnTapClick = true,
        onShowStateChanged = null,
        enabled = true,
        onChildrenClick
    }: {
        children: Snippet<[toggle: (event: Event) => void]>;
        tooltipChildren: Snippet<[toggle: (event: Event) => void]>;
        mobileFooterChildren?: Snippet<[toggle: (event: Event) => void]>;
        toggleOnTapClick?: boolean;
        onShowStateChanged?: (showing: boolean) => void;
        enabled?: boolean;
        onChildrenClick?: () => void;
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
            <!-- not a `toggle` but more like `hide` -->
            {@render children(() => (showSheet = false))}
        </button>
    {:else}
        <button onclick={() => onChildrenClick?.()} style:cursor={enabled ? 'pointer' : undefined}>
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

        {#snippet footer()}
            {@render mobileFooterChildren?.(() => (showSheet = false))}
        {/snippet}

        {@render tooltipChildren(() => (showSheet = false))}
    </SideSheet>
{/if}
