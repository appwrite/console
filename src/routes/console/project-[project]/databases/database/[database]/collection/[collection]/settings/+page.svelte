<script lang="ts">
    import { Alert, CardGrid, Box } from '$lib/components';
    import { Container } from '$lib/layout';
    import { Button, InputText, InputTags, InputSwitch, Helper } from '$lib/elements/forms';
    import { collection } from '../store';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { sdkForProject } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { difference } from '$lib/helpers/array';
    import Delete from './deleteCollection.svelte';

    const databaseId = $page.params.database;

    let showDelete = false;
    let showError: false | 'name' | 'size' = false,
        errorMessage = 'Something went wrong',
        errorType: 'error' | 'warning' | 'success' = 'error';
    let enabled: boolean = null,
        collectionName: string = null,
        collectionDocumentSecurity: boolean = null,
        collectionPermissions: string[] = [],
        arePermsDisabled = true;

    onMount(async () => {
        enabled ??= $collection.enabled;
        collectionName ??= $collection.name;
        collectionPermissions ??= $collection.$permissions;
        collectionDocumentSecurity ??= $collection.documentSecurity;
    });

    $: if (collectionDocumentSecurity || collectionPermissions) {
        if (collectionDocumentSecurity !== $collection.documentSecurity) {
            arePermsDisabled = false;
        } else if (collectionPermissions) {
            if (difference(collectionPermissions, $collection.$permissions).length) {
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
            $collection.enabled = enabled;
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
                $collection.name,
                $collection.$permissions
            );
            $collection.name = collectionName;
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
                collectionDocumentSecurity ? collectionPermissions : $collection.$permissions
            );
            $collection.$permissions = collectionPermissions;
            $collection.documentSecurity = collectionDocumentSecurity;
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
            <h2 class="heading-level-7">{$collection.name}</h2>

            <svelte:fragment slot="aside">
                <ul>
                    <InputSwitch
                        label={enabled ? 'Enabled' : 'Disabled'}
                        id="toggle"
                        bind:value={enabled} />
                </ul>
                <div>
                    <p>Created: {toLocaleDateTime($collection.$createdAt)}</p>
                    <p>Last Updated: {toLocaleDateTime($collection.$updatedAt)}</p>
                </div>
            </svelte:fragment>

            <svelte:fragment slot="actions">
                <Button disabled={enabled === $collection.enabled} on:click={togglecollection}
                    >Update</Button>
            </svelte:fragment>
        </CardGrid>

        <CardGrid>
            <h6 class="heading-level-7">Update Name</h6>

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
            <h6 class="heading-level-7">Update Permissions</h6>
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
                                value={true} />
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
                                value={false} />
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
                {:else}
                    <Alert type="info">
                        <p>
                            Tip: Add <b>role:all</b> for wildcards access. Check out our
                            documentation for more on <a class="link" href="/#">Permissions</a>
                        </p>
                    </Alert>
                    <ul class="form-list">
                        <InputTags
                            id="permissions"
                            label="Permissions"
                            placeholder="User ID, Team ID, or Role"
                            bind:tags={collectionPermissions} />
                    </ul>
                {/if}
            </svelte:fragment>
            <svelte:fragment slot="actions">
                <Button
                    disabled={arePermsDisabled}
                    on:click={() => {
                        updatePermissions();
                    }}>Update</Button>
            </svelte:fragment>
        </CardGrid>

        <CardGrid>
            <h6 class="heading-level-7">Delete collection</h6>
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
