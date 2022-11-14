<script lang="ts">
    import { CardGrid, Box, Heading } from '$lib/components';
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
    import FormList from '$lib/elements/forms/formList.svelte';

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

    $: if (
        collectionPermissions &&
        symmetricDifference(collectionPermissions, $collection.$permissions).length
    ) {
        arePermsDisabled = false;
    } else arePermsDisabled = true;

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
                collectionPermissions
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

    async function updateSecurity() {
        try {
            await sdkForProject.databases.updateCollection(
                databaseId,
                $collection.$id,
                $collection.name,
                $collection.$permissions,
                collectionDocumentSecurity
            );
            invalidate(Dependencies.COLLECTION);
            arePermsDisabled = true;
            addNotification({
                message: 'Security has been updated',
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
            <p class="text">
                Choose who can access your collection and documents. For more information, check out
                the <a
                    href="https://appwrite.io/docs/permissions"
                    target="_blank"
                    rel="noopener noreferrer">Permissions Guide</a> in our documentation.
            </p>
            <svelte:fragment slot="aside">
                {#if collectionPermissions}
                    <Permissions bind:permissions={collectionPermissions} withCreate />
                {/if}
            </svelte:fragment>
            <svelte:fragment slot="actions">
                <Button disabled={arePermsDisabled} on:click={updatePermissions}>Update</Button>
            </svelte:fragment>
        </CardGrid>

        <CardGrid>
            <Heading tag="h6" size="7">Update Document Security</Heading>
            <svelte:fragment slot="aside">
                <FormList>
                    <InputSwitch
                        bind:value={collectionDocumentSecurity}
                        id="security"
                        label="Document Security" />
                </FormList>
                <p class="text">
                    When document security is enabled, users will be able to access documents for
                    which they have been granted <b>either Document or Collection permissions</b>.
                </p>
                <p class="text">
                    If document security is disabled, users can access documents <b
                        >only if they have Collection permissions</b
                    >. Document permissions will be ignored.
                </p>
            </svelte:fragment>
            <svelte:fragment slot="actions">
                <Button
                    disabled={collectionDocumentSecurity === $collection.documentSecurity}
                    on:click={updateSecurity}>Update</Button>
            </svelte:fragment>
        </CardGrid>

        <CardGrid danger>
            <Heading tag="h6" size="7">Delete Collection</Heading>
            <p>
                The collection will be permanently deleted, including all the documents within it.
                This action is irreversible.
            </p>
            <svelte:fragment slot="aside">
                <Box>
                    <svelte:fragment slot="title">
                        <h6 class="u-bold u-trim-1">{$collection.name}</h6>
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
