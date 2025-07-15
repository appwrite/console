<script lang="ts">
    import { Layout } from '@appwrite.io/pink-svelte';
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
<div use:melt={$menu} class="menu">
    <Layout.Stack direction="column" gap="s">
        <button
            use:melt={$item}
            class="context-button"
            onclick={(e) => {
                e.preventDefault();
                // Dummy handler
                alert('Rename clicked');
            }}>
            Rename
        </button>
        <button
            use:melt={$item}
            class="context-button"
            onclick={(e) => {
                e.preventDefault();
                // Dummy handler
                alert('Duplicate clicked');
            }}>
            Duplicate
        </button>
        <button
            use:melt={$item}
            class="context-button"
            onclick={(e) => {
                e.preventDefault();
                // Dummy handler
                alert('Delete clicked');
            }}>
            Delete
        </button>
    </Layout.Stack>
</div>

<style>
    .menu {
        background-color: var(--bgcolor-neutral-primary);
        padding: var(--space-2);
        width: 150px;
        border-radius: var(--border-radius-xs);
        position: relative;
        z-index: 10;
        border: 1px solid var(--border-neutral);
        box-shadow:
            -2px 8px 16px 0px rgba(0, 0, 0, 0.02),
            -2px 20px 24px 0px rgba(0, 0, 0, 0.02);

        .context-button {
            padding: 0 var(--space-2);
            border-radius: var(--border-radius-xs);

            &:hover,
            &:focus {
                background-color: var(--overlay-neutral-hover);
            }
        }
    }
</style>
