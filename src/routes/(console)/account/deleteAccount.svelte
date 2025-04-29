<script lang="ts">
    import { AvatarInitials, BoxAvatar, CardGrid } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { user } from '$lib/stores/user';
    import Delete from './delete.svelte';

    let showDelete = false;
</script>

<CardGrid>
    <svelte:fragment slot="title">Delete account</svelte:fragment>
    Your account will be permanently deleted and access will be lost to any of your teams and data. This
    action is irreversible.
    <svelte:fragment slot="aside">
        <BoxAvatar>
            <svelte:fragment slot="image">
                <AvatarInitials size="l" name={$user.name || $user.email} />
            </svelte:fragment>
            <svelte:fragment slot="title">
                <span class="u-bold u-trim-1" data-private>{$user.name || 'User'}</span>
            </svelte:fragment>
        </BoxAvatar>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
    </svelte:fragment>
</CardGrid>

<Delete bind:showDelete />
