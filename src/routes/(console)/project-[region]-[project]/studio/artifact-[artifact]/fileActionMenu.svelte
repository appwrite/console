<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { ActionMenu, Icon, Popover } from '@appwrite.io/pink-svelte';
    import { IconDotsHorizontal } from '@appwrite.io/pink-icons-svelte';
    import { createContextMenu, melt } from '@melt-ui/svelte';
    import { writable } from 'svelte/store';
    import type { Snippet } from 'svelte';

    type Props = {
        open: boolean;
        children: Snippet;
    };

    let { open, children }: Props = $props();
    const localOpen = writable(open);

    const {
        elements: { menu, item, trigger }
    } = createContextMenu({
        open: localOpen
    });
</script>

<button use:melt={$trigger}>{@render children()}</button>
<div use:melt={$menu}>
    <ActionMenu.Root>
        <div use:melt={$item}>
            <ActionMenu.Item.Button
                on:click={(e) => {
                    e.preventDefault();
                    // Dummy handler
                    alert('Rename clicked');
                }}>
                Rename
            </ActionMenu.Item.Button>
        </div>
        <div use:melt={$item}>
            <ActionMenu.Item.Button
                on:click={(e) => {
                    e.preventDefault();
                    // Dummy handler
                    alert('Duplicate clicked');
                }}>
                Duplicate
            </ActionMenu.Item.Button>
        </div>
        <div use:melt={$item}>
            <ActionMenu.Item.Button
                on:click={(e) => {
                    e.preventDefault();
                    // Dummy handler
                    alert('Delete clicked');
                }}>
                Delete
            </ActionMenu.Item.Button>
        </div>
    </ActionMenu.Root>
</div>
