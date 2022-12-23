<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';
    import { AvatarInitials, Box, CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { getIfNonNullableObject } from '$lib/helpers/type';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import DeleteTeam from './deleteTeam.svelte';
    import { team } from './store';

    let showDelete = false;
    let teamName: string | null = null;

    onMount(async () => {
        teamName ??= $team.name;
    });

    async function updateName() {
        const args = getIfNonNullableObject({ team: $page.params.team, name: teamName });
        if (!args) return;

        try {
            await sdkForProject.teams.update(args.team, args.name);
            invalidate(Dependencies.TEAM);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
            trackEvent('submit_team_update_name');
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
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
            <Heading tag="h6" size="7">Update Name</Heading>

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
            <Heading tag="h6" size="7">Danger Zone</Heading>
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
