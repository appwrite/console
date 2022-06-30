<script lang="ts">
    import { page } from '$app/stores';
    import { Card, Avatar, CardGrid, Box } from '$lib/components';
    import { Container } from '$lib/layout';
    import { Button, InputText, Helper } from '$lib/elements/forms';
    import { sdkForProject } from '$lib/stores/sdk';
    import { toLocaleDate } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { team } from './store';
    import DeleteTeam from './_deleteTeam.svelte';

    const getAvatar = (name: string) => sdkForProject.avatars.getInitials(name, 48, 48).toString();

    let showDelete = false;
    let showError: false | 'name' | 'email' | 'password' = false;
    let errorMessage = 'Something went wrong';
    let errorType: 'error' | 'warning' | 'success' = 'error';
    let teamName: string = null;

    function addError(location: typeof showError, message: string, type: typeof errorType) {
        showError = location;
        errorMessage = message;
        errorType = type;
        setTimeout(() => {
            showError = false;
        }, 6000);
    }

    async function updateName() {
        try {
            await sdkForProject.teams.update($page.params.team, teamName);
            $team.response.name = teamName;
            teamName = null;
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
        } catch (error) {
            addError('name', error.message, 'error');
        }
    }
</script>

{#if $team.response}
    <Container>
        <Card>
            <div class="common-section grid-1-2">
                <div class="grid-1-2-col-1">
                    <div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16">
                        <Avatar
                            size={48}
                            name={$team.response.name}
                            src={getAvatar($team.response.name)} />
                        <div>
                            <h6 class="heading-level-7">{$team.response.name}</h6>
                            <p>{$team.response.total} Members</p>
                        </div>
                    </div>
                </div>
                <div class="grid-1-2-col-2">
                    <p>Created on {toLocaleDate($team.response.dateCreated)}</p>
                </div>
            </div>
        </Card>

        <CardGrid>
            <h6 class="heading-level-7">Update Name</h6>

            <svelte:fragment slot="aside">
                <ul>
                    <InputText
                        id="name"
                        label="Name"
                        placeholder={$team.response.name}
                        autocomplete={false}
                        bind:value={teamName} />
                    {#if showError === 'name'}
                        <Helper type={errorType}>{errorMessage}</Helper>
                    {/if}
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    disabled={!teamName}
                    on:click={() => {
                        updateName();
                    }}>Update</Button>
            </svelte:fragment>
        </CardGrid>

        <CardGrid>
            <div>
                <h6 class="heading-level-7">Danger Zone</h6>
            </div>

            <p>
                The team will be permanently deleted, including all data associated with this team.
                This action is irreversible.
            </p>
            <svelte:fragment slot="aside">
                <Box>
                    <svelte:fragment slot="image">
                        <Avatar
                            size={48}
                            name={$team.response.name}
                            src={getAvatar($team.response.name)} />
                    </svelte:fragment>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold">{$team.response.name}</h6>
                        <span>{$team.response.total} Members</span>
                    </svelte:fragment>
                </Box>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
            </svelte:fragment>
        </CardGrid>
    </Container>
    <DeleteTeam team={$team.response} bind:showDelete />
{/if}
