<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { ActionMenu, Icon, Popover, Status } from '@appwrite.io/pink-svelte';
    import {
        IconDotsHorizontal,
        IconTrash
    } from '@appwrite.io/pink-icons-svelte';
    import { studio } from '$lib/components/studio/studio.svelte';
    // Props can be added as needed
</script>

<Popover padding="none" placement="bottom-end" let:toggle>
    <Button
        text
        icon
        size="s"
        on:click={(e) => {
            e.preventDefault();
            toggle(e);
        }}>
        <Icon size="s" icon={IconDotsHorizontal} />
    </Button>
    <svelte:fragment slot="tooltip" let:toggle>
        <ActionMenu.Root>
            <div style="padding: 8px 16px 4px 16px;">
                <Status
                    label={studio.status}
                    status={studio.status === 'connected' ? 'complete' : 'pending'} />
            </div>
            <ActionMenu.Item.Button
                leadingIcon={IconTrash}
                on:click={(e) => {
                    e.preventDefault();
                    // Dummy handler
                    alert('Rename clicked');
                    toggle(e);
                }}>
                Rename
            </ActionMenu.Item.Button>
            <ActionMenu.Item.Button
                leadingIcon={IconTrash}
                on:click={(e) => {
                    e.preventDefault();
                    // Dummy handler
                    alert('Duplicate clicked');
                    toggle(e);
                }}>
                Duplicate
            </ActionMenu.Item.Button>
            <ActionMenu.Item.Button
                leadingIcon={IconTrash}
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