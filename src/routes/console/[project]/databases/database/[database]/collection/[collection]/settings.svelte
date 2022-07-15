<script lang="ts">
    import { Alert, CardGrid, Box } from '$lib/components';
    import { Container } from '$lib/layout';
    import { Button, InputText, InputTags, InputSwitch, Helper } from '$lib/elements/forms';
    import { collection } from './store';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { sdkForProject } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import Delete from './_delete.svelte';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';

    let showDelete = false;
    let showError: false | 'name' | 'size' = false,
        errorMessage = 'Something went wrong',
        errorType: 'error' | 'warning' | 'success' = 'error';
    let enabled: boolean = null,
        collectionName: string = null,
        collectionPermissions: string = null,
        collectionRead: string[] = null,
        collectionWrite: string[] = null,
        arePermsDisabled = true;

    onMount(async () => {
        await collection.load($page.params.collection);
        enabled ??= $collection.enabled;
        collectionName ??= $collection.name;
        collectionName ??= $collection.name;
        collectionPermissions ??= $collection.permission;
        collectionRead ??= $collection.$read;
        collectionWrite ??= $collection.$write;
    });

    $: if (collectionPermissions || collectionRead || collectionWrite) {
        if (collectionPermissions !== $collection.permission) {
            arePermsDisabled = false;
        } else if (collectionRead) {
            if (JSON.stringify(collectionRead) !== JSON.stringify($collection.$read)) {
                arePermsDisabled = false;
            } else arePermsDisabled = true;
        } else if (collectionWrite) {
            if (JSON.stringify(collectionWrite) !== JSON.stringify($collection.$write)) {
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
                $collection.$id,
                $collection.name,
                $collection.permission,
                $collection.$read,
                $collection.$write,
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
                $collection.$id,
                $collection.name,
                $collection.permission
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
                $collection.$id,
                $collection.name,
                collectionPermissions,
                collectionPermissions === 'collection' ? collectionRead : $collection.$read,
                collectionPermissions === 'collection' ? collectionWrite : $collection.$write
            );
            $collection.permission = collectionPermissions;
            $collection.$read = collectionRead;
            $collection.$write = collectionWrite;
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
                <Button
                    disabled={enabled === $collection.enabled}
                    on:click={() => {
                        togglecollection();
                    }}>Update</Button>
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
                    on:click={() => {
                        updateName();
                    }}>Update</Button>
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
                <ul class="u-flex u-gap-12 common-section">
                    <li>
                        <label class="label">
                            <input
                                type="radio"
                                class="is-small"
                                name="level"
                                bind:group={collectionPermissions}
                                value="collection" />
                            <span>Collection Level</span>
                        </label>
                    </li>
                    <li>
                        <label class="label">
                            <input
                                type="radio"
                                class="is-small"
                                name="level"
                                bind:group={collectionPermissions}
                                value="file" />
                            <span>Document Level</span>
                        </label>
                    </li>
                </ul>
                <Alert type="info">
                    <p>
                        Tip: Add <b>role:all</b> for wildcards access. Check out our documentation
                        for more on <a href="/#">Permissions</a>
                    </p>
                </Alert>
                {#if collectionPermissions === 'collection'}
                    <ul class="common-section">
                        <InputTags
                            id="read"
                            label="Read Access"
                            placeholder="User ID, Team ID, or Role"
                            bind:tags={collectionRead} />
                        <InputTags
                            id="write"
                            label="Write Access"
                            placeholder="User ID, Team ID, or Role"
                            bind:tags={collectionWrite} />
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
