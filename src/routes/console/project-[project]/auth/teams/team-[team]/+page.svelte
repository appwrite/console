<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { CardGrid, Box, Heading, AvatarInitials } from '$lib/components';
    import { Container } from '$lib/layout';
    import { Button, InputText, Form } from '$lib/elements/forms';
    import { sdkForProject } from '$lib/stores/sdk';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { team } from './store';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import DeleteTeam from './deleteTeam.svelte';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    let showDelete = false;
    let teamName: string = null;

    onMount(async () => {
        teamName ??= $team.name;
    });

    async function updateName() {
        try {
            await sdkForProject.teams.update($page.params.team, teamName);
            invalidate(Dependencies.TEAM);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
            trackEvent(Submit.TeamUpdateName);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.TeamUpdateName);
        }
    }
</script>

<Container>
    <CardGrid>
        <div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16">
            <AvatarInitials size={48} name={$team.name} />
            <div>
                <Heading tag="h6" size="7">{$team.name}</Heading>
            </div>
        </div>
        <svelte:fragment slot="aside">
            <div>
                <p>{$team.total} Members</p>
                <p>Created on {toLocaleDateTime($team.$createdAt)}</p>
            </div>
        </svelte:fragment>
    </CardGrid>

    <Form on:submit={updateName}>
        <CardGrid>
            <Heading tag="h6" size="7">Name</Heading>

            <svelte:fragment slot="aside">
                <ul>
                    <InputText
                        id="name"
                        label="Name"
                        placeholder="Enter team name"
                        autocomplete={false}
                        bind:value={teamName} />
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button submit disabled={teamName === $team.name || !teamName}>Update</Button>
            </svelte:fragment>
        </CardGrid>
    </Form>

    <CardGrid danger>
        <div>
            <Heading tag="h6" size="7">Delete Team</Heading>
        </div>

        <p>
            The team will be permanently deleted, including all data associated with this team. This
            action is irreversible.
        </p>
        <svelte:fragment slot="aside">
            <Box>
                <svelte:fragment slot="image">
                    <AvatarInitials size={48} name={$team.name} />
                </svelte:fragment>
                <svelte:fragment slot="title">
                    <h6 class="u-bold u-trim-1">{$team.name}</h6>
                    <span>{$team.total} Members</span>
                </svelte:fragment>
            </Box>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button secondary on:click={() => (showDelete = true)} event="delete_team">
                Delete
            </Button>
        </svelte:fragment>
    </CardGrid>
</Container>
<DeleteTeam team={$team} bind:showDelete />
