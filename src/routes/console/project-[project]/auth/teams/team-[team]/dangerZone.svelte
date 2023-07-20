<script lang="ts">
    import { AvatarInitials, Box, CardGrid, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import DeleteTeam from './deleteTeam.svelte';
    import { team } from './store';
    import LL from '$i18n/i18n-svelte';

    let showDelete = false;
</script>

<CardGrid danger>
    <div>
        <Heading tag="h6" size="7">{$LL.console.project.title.deleteTeam()}</Heading>
    </div>

    <p>
        {$LL.console.project.texts.teams.dangerZone()}
    </p>
    <svelte:fragment slot="aside">
        <Box>
            <svelte:fragment slot="image">
                <AvatarInitials size={48} name={$team.name} />
            </svelte:fragment>
            <svelte:fragment slot="title">
                <h6 class="u-bold u-trim-1">{$team.name}</h6>
                <span>{$team.total}{' '}{$LL.console.project.texts.teams.members()}</span>
            </svelte:fragment>
        </Box>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button secondary on:click={() => (showDelete = true)} event="delete_team"
            >{$LL.console.project.button.submit.delete()}</Button>
    </svelte:fragment>
</CardGrid>
<DeleteTeam team={$team} bind:showDelete />
