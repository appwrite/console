<script lang="ts">
    import { page } from '$app/stores';
    import { Card, Avatar } from '$lib/components';
    import { Container } from '$lib/layout';
    import { Button, InputText, Helper } from '$lib/elements/forms';
    import { sdkForProject } from '$lib/stores/sdk';
    import { toLocaleDate } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { team } from './store';
    import DeleteTeam from './_deleteTeam.svelte';

    const getAvatar = (name: string) =>
        sdkForProject.avatars.getInitials(name, 128, 128).toString();

    let showDelete = false;
    let showError: false | 'name' | 'email' | 'password' = false;
    let errorMessage = 'Something went wrong';
    let errorType: 'error' | 'warning' | 'success' = 'error';
    let teamName = null;

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
            <div class="u-flex u-main-space-between u-gap-12 common-section">
                <div class="user-profile-button">
                    <Avatar
                        size={40}
                        name={$team.response.name}
                        src={getAvatar($team.response.name)} />
                    <span class="user-profile-info">
                        <h6 class="heading-level-7">{$team.response.name}</h6>
                        <span class="title">{$team.response.total} Members</span>
                    </span>
                </div>
                <div>
                    <p>Created on {toLocaleDate($team.response.dateCreated)}</p>
                </div>
            </div>
        </Card>
        <Card>
            <div class="u-flex u-main-space-between u-gap-12 common-section">
                <h6 class="heading-level-7">Update Name</h6>
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
            </div>
            <div class="u-flex u-main-space-end common-section">
                <Button
                    disabled={!teamName}
                    on:click={() => {
                        updateName();
                    }}>Update</Button>
            </div>
        </Card>

        <Card>
            <div class="u-flex u-main-space-between u-gap-12 common-section">
                <div>
                    <h6 class="heading-level-7">Danger Zone</h6>
                    <p>
                        The team will be permanently deleted, including all data associated with
                        this team. This action is irreversible.
                    </p>
                </div>
                <div>
                    <div class="user-profile-button">
                        <Avatar
                            size={64}
                            name={$team.response.name}
                            src={getAvatar($team.response.name)} />
                        <span class="user-profile-info">
                            <h6 class="heading-level-7">{$team.response.name}</h6>
                            <span class="title">{$team.response.total} Members</span>
                        </span>
                    </div>
                </div>
            </div>
            <div class="u-flex u-main-space-end common-section">
                <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
            </div>
        </Card>
    </Container>
    <DeleteTeam team={$team.response} bind:showDelete />
{/if}
