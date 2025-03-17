<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { providers } from './providers/store';
    import { ActionMenu, Icon, Popover } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
</script>

<Popover let:toggle padding="none" placement="bottom-end">
    <slot {toggle}>
        <Button on:click={toggle} event="create_message">
            <Icon icon={IconPlus} slot="start" size="s" />
            Create message
        </Button>
    </slot>
    <ActionMenu.Root slot="tooltip">
        {#each Object.entries(providers) as [type, option]}
            <ActionMenu.Item.Anchor
                leadingIcon={option.icon}
                href={`${base}/project-${$page.params.project}/messaging/create-${type}`}>
                {option.name}
            </ActionMenu.Item.Anchor>
        {/each}
    </ActionMenu.Root>
</Popover>
