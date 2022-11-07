<script lang="ts">
    import { Alert, CardGrid, Box, Heading } from '$lib/components';
    import { Container } from '$lib/layout';
    import { Button, InputText, InputSwitch, Helper } from '$lib/elements/forms';
    import { Permissions } from '$lib/components/permissions';
    import { collection } from '../store';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { sdkForProject } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { symmetricDifference } from '$lib/helpers/array';
    import Delete from './deleteCollection.svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    const databaseId = $page.params.database;

    let showDelete = false;
    let showError: false | 'name' | 'size' = false,
        errorMessage = 'Something went wrong',
        errorType: 'error' | 'warning' | 'success' = 'error';
    let enabled: boolean = null,
        collectionName: string = null,
        collectionDocumentSecurity: boolean = null,
        collectionPermissions: string[] = null,
        arePermsDisabled = true;

    onMount(() => {
        enabled ??= $collection.enabled;
        collectionName ??= $collection.name;
        collectionPermissions ??= $collection.$permissions;
        collectionDocumentSecurity ??= $collection.documentSecurity;
    });

    $: if (collectionDocumentSecurity || collectionPermissions) {
        if (collectionDocumentSecurity !== $collection.documentSecurity) {
            arePermsDisabled = false;
        } else if (collectionPermissions) {
            if (symmetricDifference(collectionPermissions, $collection.$permissions).length) {
                arePermsDisabled = false;
            } else arePermsDisabled = true;
        }
    }

    function addError(location: typeof showError, message: string, type: typeof errorType) {
        showError = location;
        errorMessage = message;
        errorType = type;
    }

    async function togglecollection() {
        try {
            await sdkForProject.databases.updateCollection(
                databaseId,
                $collection.$id,
                $collection.name,
                $collection.$permissions,
                $collection.documentSecurity,
                enabled
            );
            invalidate(Dependencies.COLLECTION);
            addNotification({
                message: `${$collection.name} has been updated`,
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }
    async function updateName() {
        try {
            await sdkForProject.databases.updateCollection(
                databaseId,
                $collection.$id,
                collectionName,
                $collection.$permissions
            );
            invalidate(Dependencies.COLLECTION);
            showError = false;
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
        } catch (error) {
            addError('name', error.message, 'error');
        }
    }
    async function updatePermissions() {
        try {
            await sdkForProject.databases.updateCollection(
                databaseId,
                $collection.$id,
                $collection.name,
                collectionDocumentSecurity ? $collection.$permissions : collectionPermissions
            );
            invalidate(Dependencies.COLLECTION);
            arePermsDisabled = true;
            addNotification({
                message: 'Permissions have been updated',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    }
</script>

<Container>
    {#if $collection}
        <CardGrid>
            <Heading tag="h2" size="7">{$collection.name}</Heading>

            <svelte:fragment slot="aside">
                <ul>
                    <InputSwitch
                        id="toggle"
                        label={enabled ? 'Enabled' : 'Disabled'}
                        bind:value={enabled} />
                </ul>
                <div>
                    <p>Created: {toLocaleDateTime($collection.$createdAt)}</p>
                    <p>Last Updated: {toLocaleDateTime($collection.$updatedAt)}</p>
                </div>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={enabled === $collection.enabled} on:click={togglecollection}>
                    Update
                </Button>
            </svelte:fragment>
        </CardGrid>

        <CardGrid>
            <Heading tag="h6" size="7">Update Name</Heading>

            <svelte:fragment slot="aside">
                <ul>
                    <InputText
                        id="name"
                        label="Name"
                        placeholder="Enter name"
                        autocomplete={false}
                        bind:value={collectionName} />
                    {#if showError === 'name'}
                        <Helper type={errorType}>{errorMessage}</Helper>
                    {/if}
                </ul>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button
                    disabled={collectionName === $collection.name || !collectionName}
                    on:click={updateName}>Update</Button>
            </svelte:fragment>
        </CardGrid>
        <CardGrid>
            <Heading tag="h6" size="7">Update Permissions</Heading>
            <p>
                Assign read or write permissions at the <b>Collection Level</b> or
                <b>Document Level</b>. If collection Level permissions are assigned, permissions
                applied to individual documents are ignored.
            </p>
            <svelte:fragment slot="aside">
                <ul class="checkboxes-list">
                    <li class="checkboxes-item">
                        <label class="label">
                            <input
                                type="radio"
                                class="is-small"
                                name="level"
                                bind:group={collectionDocumentSecurity}
                                value={false} />
                            <span>Collection Level</span>
                        </label>
                    </li>
                    <li class="checkboxes-item">
                        <label class="label">
                            <input
                                type="radio"
                                class="is-small"
                                name="level"
                                bind:group={collectionDocumentSecurity}
                                value={true} />
                            <span>Document Level</span>
                        </label>
                    </li>
                </ul>

                {#if collectionDocumentSecurity}
                    <Alert type="info">
                        <p>
                            Manage permissions at the <b>Document Level</b> to control access over
                            every document in your collection. Check out our documentation for more
                            on
                            <a class="link" href="/#">Permissions</a>
                        </p>
                    </Alert>
                {:else if collectionPermissions !== null}
                    <Permissions bind:permissions={collectionPermissions} withCreate />
                {/if}
            </svelte:fragment>
            <svelte:fragment slot="actions">
                <Button disabled={arePermsDisabled} on:click={updatePermissions}>Update</Button>
            </svelte:fragment>
        </CardGrid>

        <CardGrid>
            <Heading tag="h6" size="7">Delete Collection</Heading>
            <p>
                The collection will be permanently deleted, including all the documents within it.
                This action is irreversible.
            </p>
            <svelte:fragment slot="aside">
                <Box>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold">{$collection.name}</h6>
                    </svelte:fragment>
                    <p>Last Updated: {toLocaleDateTime($collection.$updatedAt)}</p>
                </Box>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

<Delete bind:showDelete />
