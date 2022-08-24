<script lang="ts">
    import Avatar from './avatar.svelte';
    export let avatars = [];
    export let total = avatars.length;
</script>

<ul class="avatars-group">
    {#each avatars as av, index}
        {#if index < 2}
            <li class="avatars-group-item">
                <Avatar size={40} src={av.img} name={av.name} />
            </li>
        {/if}
    {/each}
    {#if total > 2}
        <li class="avatars-group-item">
            <div class="avatar">+{total - 2}</div>
        </li>
    {/if}
</ul>
