<script lang="ts">
    import { ActionMenu } from '@appwrite.io/pink-svelte';
    import { createContextMenu, melt } from '@melt-ui/svelte';

    import type { Snippet } from 'svelte';

    type Props = {
        children: Snippet;
    };

    let { children }: Props = $props();
    const {
        elements: { menu, item, trigger }
    } = createContextMenu();
</script>

<button use:melt={$trigger}>{@render children()}</button>
<div use:melt={$menu}>
    <ActionMenu.Root>
        <button
            use:melt={$item}
            onclick={(e) => {
                e.preventDefault();
                // Dummy handler
                alert('Rename clicked');
            }}>
            Rename
        </button>
        <button
            use:melt={$item}
            onclick={(e) => {
                e.preventDefault();
                // Dummy handler
                alert('Duplicate clicked');
            }}>
            Duplicate
        </button>

        <button
            use:melt={$item}
            onclick={(e) => {
                e.preventDefault();
                // Dummy handler
                alert('Delete clicked');
            }}>
            Delete
        </button>
    </ActionMenu.Root>
</div>
