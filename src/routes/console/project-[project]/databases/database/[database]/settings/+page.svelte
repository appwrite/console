<script lang="ts">
    import { page } from '$app/stores';
    import { Card, Avatar, CardGrid, Box, Heading } from '$lib/components';
    import { Container } from '$lib/layout';
    import { Button, InputText, Helper } from '$lib/elements/forms';
    import { sdkForProject } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { database } from '../store';
    import Delete from '../_delete.svelte';
    import { onMount } from 'svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';

    const databaseId = $page.params.database;
    const getAvatar = (name: string) => sdkForProject.avatars.getInitials(name, 48, 48).toString();

    let showDelete = false;
    let showError: false | 'name' | 'email' | 'password' = false;
    let errorMessage = 'Something went wrong';
    let errorType: 'error' | 'warning' | 'success' = 'error';
    let databaseName: string = null;

    onMount(async () => {
        await database.load(databaseId);
        databaseName ??= $database.name;
    });

    function addError(location: typeof showError, message: string, type: typeof errorType) {
        showError = location;
        errorMessage = message;
        errorType = type;
    }

    async function updateName() {
        try {
            await sdkForProject.teams.update($page.params.team, databaseName);
            $database.name = databaseName;
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
        } catch (error) {
            addError('name', error.message, 'error');
        }
    }
</script>

{#if $database}
    <Container>
        <Card>
            <div class="common-section grid-1-2">
                <div class="grid-1-2-col-1">
                    <div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16">
                        <Avatar size={48} name={$database.name} src={getAvatar($database.name)} />
                        <Heading tag="h6" size="7">{$database.name}</Heading>
                    </div>
                </div>
                <div class="grid-1-2-col-2">
                    <p>Created: {toLocaleDateTime($database.$createdAt)}</p>
                    <p>Last Updated: {toLocaleDateTime($database.$updatedAt)}</p>
                </div>
            </div>
        </Card>

        <CardGrid>
            <Heading tag="h6" size="7">Update Name</Heading>

            <svelte:fragment slot="aside">
                <ul>
                    <InputText
                        id="name"
                        label="Name"
                        placeholder="Enter database name"
                        autocomplete={false}
                        bind:value={databaseName} />
                    {#if showError === 'name'}
                        <Helper type={errorType}>{errorMessage}</Helper>
                    {/if}
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    disabled={databaseName === $database.name || !databaseName}
                    on:click={() => {
                        updateName();
                    }}>Update</Button>
            </svelte:fragment>
        </CardGrid>

        <CardGrid>
            <div>
                <Heading tag="h6" size="7">Danger Zone</Heading>
            </div>

            <p>
                The database will be permanently deleted, including all data associated with this
                team. This action is irreversible.
            </p>
            <svelte:fragment slot="aside">
                <Box>
                    <svelte:fragment slot="image">
                        <Avatar size={48} name={$database.name} src={getAvatar($database.name)} />
                    </svelte:fragment>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold">{$database.name}</h6>
                        <span>Last Updated: TO IMPLEMENT</span>
                    </svelte:fragment>
                </Box>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
            </svelte:fragment>
        </CardGrid>
    </Container>
    <Delete bind:showDelete />
{/if}
