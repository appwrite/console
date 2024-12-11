<script lang="ts">
    import AvatarInitials from './avatarInitials.svelte';

    export let avatars: string[] = [];
    export let icons: string[] = [];
    export let total = avatars.length;
    export let size = 40;
    export let avatarSize: keyof typeof Sizes = 'medium';
    export let bordered = false;
    export let color = '';

    let classes = '';
    export { classes as class };

    enum Sizes {
        xsmall = 'is-size-x-small',
        small = 'is-size-small',
        medium = '',
        large = 'is-size-large',
        xlarge = 'is-size-x-large'
    }
</script>

<ul class="avatars-group {classes}" class:is-with-border={bordered}>
    {#each avatars as name, index}
        {#if index < 2}
            <li class="avatars-group-item">
                <AvatarInitials {size} {name} />
            </li>
        {/if}
    {/each}

    {#each icons as icon}
        <li class="avatars-group-item">
            <span class="avatar {Sizes[avatarSize]} {color}"><span class={`icon-${icon}`} /></span>
        </li>
    {/each}

    {#if total > 2}
        <li class="avatars-group-item">
            <div class="avatar {Sizes[avatarSize]} {color}">+{total - 2}</div>
        </li>
    {/if}
</ul>
