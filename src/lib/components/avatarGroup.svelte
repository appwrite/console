<script lang="ts">
    import { AvatarGroup, Avatar, Icon } from '@appwrite.io/pink-svelte';
    import AvatarInitials from './avatarInitials.svelte';
    import type { ComponentProps, ComponentType } from 'svelte';

    export let avatars: string[] = [];
    export let icons: ComponentType[] = [];
    export let total = avatars.length;
    export let size: ComponentProps<Avatar>['size'] = 'm';
</script>

<AvatarGroup>
    {#each avatars as name, index}
        {#if index < 2}
            <AvatarInitials {size} {name} />
        {/if}
    {/each}

    {#each icons as icon}
        <Avatar {size}>
            <Icon {icon} size="s" />
        </Avatar>
    {/each}

    {#if total > 2}
        <Avatar {size}>
            <span style:font-size="10px">
                +{total - 2}
            </span>
        </Avatar>
    {/if}
</AvatarGroup>
