<script lang="ts">
    import AvatarInitials from './avatarInitials.svelte';

    export let avatars: string[] = [];
    export let icons: string[] = [];
    export let total = avatars.length;
    export let size = 40;
</script>

<ul class="avatars-group">
    {#each avatars as name, index}
        {#if index < 2}
            <li class="avatars-group-item">
                <AvatarInitials {size} {name} />
            </li>
        {/if}
    {/each}

    {#each icons as icon}
        <li class="avatars-group-item">
            <span class="avatar"><span class={`icon-${icon}`} /></span>
        </li>
    {/each}

    {#if total > 2}
        <li class="avatars-group-item">
            <div class="avatar">+{total - 2}</div>
        </li>
    {/if}
</ul>
