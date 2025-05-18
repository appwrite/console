<script lang="ts">
    import { AvatarInitials, BoxAvatar, CardGrid } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import DeleteTeam from './deleteTeam.svelte';
    import { team } from './store';

    let showDelete = false;
</script>

<CardGrid>
    <svelte:fragment slot="title">Delete team</svelte:fragment>
    The team will be permanently deleted, including all data associated with this team. This action is
    irreversible.
    <svelte:fragment slot="aside">
        <BoxAvatar>
            <svelte:fragment slot="image">
                <AvatarInitials name={$team.name} />
            </svelte:fragment>
            <svelte:fragment slot="title">
                <h6 class="u-bold u-trim-1">{$team.name}</h6>
                <span>{$team.total} Members</span>
            </svelte:fragment>
        </BoxAvatar>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button secondary on:click={() => (showDelete = true)} event="delete_team">Delete</Button>
    </svelte:fragment>
</CardGrid>
<DeleteTeam team={$team} bind:showDelete />
