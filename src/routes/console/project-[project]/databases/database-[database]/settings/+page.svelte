<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';
    import { AvatarInitials, Box, Card, CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Helper, InputText } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { getIfStringObject } from '$lib/helpers/type';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import Delete from '../delete.svelte';
    import { database } from '../store';

    let showDelete = false;
    let showError: false | 'name' | 'email' | 'password' = false;
    let errorMessage = 'Something went wrong';
    let errorType: 'error' | 'warning' | 'success' = 'error';
    let databaseName: string | null = null;

    onMount(async () => {
        databaseName ??= $database.name;
    });

    function addError(location: typeof showError, message: string, type: typeof errorType) {
        showError = location;
        errorMessage = message;
        errorType = type;
    }

    async function updateName() {
        const args = getIfStringObject({ db: $page.params.database, dbName: databaseName });
        if (!args) return;

        try {
            await sdkForProject.databases.update(args.db, args.dbName);
            invalidate(Dependencies.DATABASE);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
            trackEvent('submit_database_update_name');
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
                        <AvatarInitials size={48} name={$database.name} />
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

        <CardGrid danger>
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
                        <AvatarInitials size={48} name={$database.name} />
                    </svelte:fragment>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold u-trim-1">{$database.name}</h6>
                        <span>Last Updated: {toLocaleDateTime($database.$updatedAt)}</span>
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
