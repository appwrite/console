<script lang="ts">
    import type { Snippet } from 'svelte';
    import { Popover } from '@appwrite.io/pink-svelte';
    import { isSmallViewport } from '$lib/stores/viewport';

    let {
        children,
        tooltipChildren,
        toggleOnTapClick = true,
        onShowStateChanged = null
    }: {
        children: Snippet<[toggle: (event: Event) => void]>;
        tooltipChildren: Snippet<[toggle: (event: Event) => void]>;
        toggleOnTapClick: boolean;
        onShowStateChanged?: (showing: boolean) => void;
    } = $props();
</script>

<Popover let:toggle let:showing placement="bottom-start" portal>
    {onShowStateChanged?.(showing)}

    {#if toggleOnTapClick && $isSmallViewport}
        <button onclick={toggle} aria-label="Open column review modal">
            {@render children(toggle)}
        </button>
    {:else}
        {@render children(toggle)}
    {/if}

    <div slot="tooltip" let:toggle style:width="480px" style:padding="16px">
        {@render tooltipChildren(toggle)}
    </div>
</Popover>
