<script lang="ts">
    import type { Snippet } from 'svelte';
    import { Popover } from '@appwrite.io/pink-svelte';

    let {
        children,
        tooltipChildren,
        onShowStateChanged = null
    }: {
        children: Snippet<[toggle: (event: Event) => void]>;
        tooltipChildren: Snippet<[toggle: (event: Event) => void]>;
        onShowStateChanged?: (showing: boolean) => void;
    } = $props();
</script>

<Popover let:toggle let:showing placement="bottom-start" portal>
    {onShowStateChanged?.(showing)}

    {@render children(toggle)}

    <div slot="tooltip" let:toggle style:width="480px" style:padding="16px">
        {@render tooltipChildren(toggle)}
    </div>
</Popover>
