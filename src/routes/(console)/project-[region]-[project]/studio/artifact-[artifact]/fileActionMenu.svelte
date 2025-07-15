<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { ActionMenu, Icon, Popover } from '@appwrite.io/pink-svelte';
    import { IconDotsHorizontal } from '@appwrite.io/pink-icons-svelte';
</script>

<Popover padding="none" placement="bottom-end" let:toggle --action-menu-root-width="100px">
    <Button
        text
        icon
        size="s"
        class="file-action-menu-button"
        on:click={(e) => {
            e.preventDefault();
            toggle(e);
        }}>
        <Icon size="s" icon={IconDotsHorizontal} />
    </Button>
    <svelte:fragment slot="tooltip" let:toggle>
        <ActionMenu.Root>
            <ActionMenu.Item.Button
                on:click={(e) => {
                    e.preventDefault();
                    // Dummy handler
                    alert('Rename clicked');
                    toggle(e);
                }}>
                Rename
            </ActionMenu.Item.Button>
            <ActionMenu.Item.Button
                on:click={(e) => {
                    e.preventDefault();
                    // Dummy handler
                    alert('Duplicate clicked');
                    toggle(e);
                }}>
                Duplicate
            </ActionMenu.Item.Button>
            <ActionMenu.Item.Button
                on:click={(e) => {
                    e.preventDefault();
                    // Dummy handler
                    alert('Delete clicked');
                    toggle(e);
                }}>
                Delete
            </ActionMenu.Item.Button>
        </ActionMenu.Root>
    </svelte:fragment>
</Popover>

<style>
    :global(.file-action-menu-button) {
        background-color: transparent !important;
        outline: none !important;
        border: 0 !important;
        border-radius: 0 !important;
    }
</style>
